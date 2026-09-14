import { db } from '../config/firebase.js';
import { createNotification } from './notificationController.js';
import { calculateRankingScore } from './rankingController.js';

export const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;

    let query = db.collection('projects');

    if (req.user.role === 'freelancer') {
      query = query.where('freelancerId', '==', userId);
    } else if (req.user.role === 'client') {
      query = query.where('clientId', '==', userId);
    }

    const projectsSnapshot = await query.get();

    let projectDocs = projectsSnapshot.docs;

    // Filter by status in memory if provided
    // Support both single status and awaiting_confirmation
    if (status) {
      if (status === 'ongoing') {
        // For ongoing, show both ongoing and awaiting_confirmation
        projectDocs = projectDocs.filter(doc => 
          doc.data().status === 'ongoing' || doc.data().status === 'awaiting_confirmation'
        );
      } else {
        projectDocs = projectDocs.filter(doc => doc.data().status === status);
      }
    }

    const projects = await Promise.all(projectDocs.map(async (doc) => {
      const projectData = { id: doc.id, ...doc.data() };
      
      const jobDoc = await db.collection('jobs').doc(projectData.jobId).get();
      projectData.job = jobDoc.exists ? jobDoc.data() : null;

      if (req.user.role === 'freelancer') {
        const clientDoc = await db.collection('users').doc(projectData.clientId).get();
        projectData.client = clientDoc.exists ? {
          fullName: clientDoc.data().fullName,
          companyName: clientDoc.data().companyName,
          profileImage: clientDoc.data().profileImage
        } : null;
      } else {
        const freelancerDoc = await db.collection('users').doc(projectData.freelancerId).get();
        projectData.freelancer = freelancerDoc.exists ? {
          fullName: freelancerDoc.data().fullName,
          profileImage: freelancerDoc.data().profileImage,
          skillCategory: freelancerDoc.data().skillCategory
        } : null;
      }

      return projectData;
    }));

    // Sort by startedAt in memory
    projects.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

    res.json({ success: true, projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

export const getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectData = { id: projectDoc.id, ...projectDoc.data() };

    // Verify access
    if (projectData.clientId !== userId && projectData.freelancerId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get job details
    const jobDoc = await db.collection('jobs').doc(projectData.jobId).get();
    projectData.job = jobDoc.exists ? { id: jobDoc.id, ...jobDoc.data() } : null;

    // Get application details
    const appDoc = await db.collection('applications').doc(projectData.applicationId).get();
    projectData.application = appDoc.exists ? { id: appDoc.id, ...appDoc.data() } : null;

    // Get client details with contact info
    const clientDoc = await db.collection('users').doc(projectData.clientId).get();
    if (clientDoc.exists) {
      const clientData = clientDoc.data();
      projectData.client = {
        uid: projectData.clientId,
        fullName: clientData.fullName,
        companyName: clientData.companyName,
        profileImage: clientData.profileImage,
        country: clientData.country,
        // Contact info only visible if project is ongoing or completed
        whatsapp: (projectData.status === 'ongoing' || projectData.status === 'completed') ? clientData.whatsapp : null,
        email: (projectData.status === 'ongoing' || projectData.status === 'completed') ? clientData.email : null
      };
    }

    // Get freelancer details with contact info
    const freelancerDoc = await db.collection('users').doc(projectData.freelancerId).get();
    if (freelancerDoc.exists) {
      const freelancerData = freelancerDoc.data();
      projectData.freelancer = {
        uid: projectData.freelancerId,
        fullName: freelancerData.fullName,
        profileImage: freelancerData.profileImage,
        skillCategory: freelancerData.skillCategory,
        country: freelancerData.country,
        // Contact info only visible if project is ongoing or completed
        whatsapp: (projectData.status === 'ongoing' || projectData.status === 'completed') ? freelancerData.whatsapp : null,
        email: (projectData.status === 'ongoing' || projectData.status === 'completed') ? freelancerData.email : null
      };
    }

    // Get project chat
    const projectChatsSnapshot = await db.collection('projectChats')
      .where('projectId', '==', projectId)
      .where('active', '==', true)
      .get();

    if (!projectChatsSnapshot.empty) {
      projectData.chatId = projectChatsSnapshot.docs[0].id;
    }

    res.json({ success: true, project: projectData });
  } catch (error) {
    console.error('Get project details error:', error);
    res.status(500).json({ message: 'Failed to fetch project details' });
  }
};

export const completeProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectData = projectDoc.data();
    if (projectData.clientId !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await db.collection('projects').doc(projectId).update({
      status: 'completed',
      completedAt: new Date().toISOString()
    });

    await db.collection('jobs').doc(projectData.jobId).update({
      status: 'completed'
    });

    // Update freelancer ranking score
    if (projectData.freelancerId) {
      await calculateRankingScore(projectData.freelancerId);
    }

    res.json({ success: true, message: 'Project marked as completed' });
  } catch (error) {
    console.error('Complete project error:', error);
    res.status(500).json({ message: 'Failed to complete project' });
  }
};

// STEP 1: Freelancer marks project as finished
export const markAsFinished = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectData = projectDoc.data();
    
    // Only freelancer can mark as finished
    if (projectData.freelancerId !== userId) {
      return res.status(403).json({ message: 'Only freelancer can mark project as finished' });
    }

    // Can only mark ongoing projects as finished
    if (projectData.status !== 'ongoing') {
      return res.status(400).json({ message: 'Project must be ongoing to mark as finished' });
    }

    await db.collection('projects').doc(projectId).update({
      status: 'awaiting_confirmation',
      markedFinishedAt: new Date().toISOString()
    });

    // Get job details for notification
    const jobDoc = await db.collection('jobs').doc(projectData.jobId).get();
    const jobTitle = jobDoc.exists ? jobDoc.data().title : 'Project';

    // Send notification to client
    await createNotification(
      projectData.clientId,
      userId,
      'project_finished',
      {
        projectId,
        jobTitle,
        message: 'Freelancer has finished the project. Please review and confirm completion.'
      }
    );

    res.json({ 
      success: true, 
      message: 'Project marked as finished. Waiting for client confirmation.' 
    });
  } catch (error) {
    console.error('Mark as finished error:', error);
    res.status(500).json({ message: 'Failed to mark project as finished' });
  }
};

// STEP 2A: Client approves and completes
export const approveCompletion = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectData = projectDoc.data();
    
    // Only client can approve
    if (projectData.clientId !== userId) {
      return res.status(403).json({ message: 'Only client can approve completion' });
    }

    // Can only approve projects awaiting confirmation
    if (projectData.status !== 'awaiting_confirmation') {
      return res.status(400).json({ message: 'Project must be awaiting confirmation' });
    }

    await db.collection('projects').doc(projectId).update({
      status: 'completed',
      completedAt: new Date().toISOString()
    });

    // Update job status
    await db.collection('jobs').doc(projectData.jobId).update({
      status: 'completed'
    });

    res.json({ 
      success: true, 
      message: 'Project approved and completed!' 
    });
  } catch (error) {
    console.error('Approve completion error:', error);
    res.status(500).json({ message: 'Failed to approve completion' });
  }
};

// STEP 2B: Client requests revision
export const requestRevision = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { revisionNotes } = req.body;
    const userId = req.user.userId;

    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectData = projectDoc.data();
    
    // Only client can request revision
    if (projectData.clientId !== userId) {
      return res.status(403).json({ message: 'Only client can request revision' });
    }

    // Can only request revision for projects awaiting confirmation
    if (projectData.status !== 'awaiting_confirmation') {
      return res.status(400).json({ message: 'Project must be awaiting confirmation' });
    }

    await db.collection('projects').doc(projectId).update({
      status: 'ongoing',
      revisionRequested: true,
      revisionNotes: revisionNotes || '',
      revisionRequestedAt: new Date().toISOString()
    });

    // TODO: Send notification to freelancer
    // For now, we'll just return success

    res.json({ 
      success: true, 
      message: 'Revision requested. Project moved back to ongoing.' 
    });
  } catch (error) {
    console.error('Request revision error:', error);
    res.status(500).json({ message: 'Failed to request revision' });
  }
};

// Update task status (not_started, in_progress, finished)
const updateTaskStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { taskStatus } = req.body;
    const userId = req.user.userId;

    const validStatuses = ['not_started', 'in_progress', 'finished'];
    if (!validStatuses.includes(taskStatus)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = projectDoc.data();

    // Only freelancer can update task status
    if (project.freelancerId !== userId) {
      return res.status(403).json({ message: 'Only the freelancer can update task status' });
    }

    // Can only update if project is ongoing
    if (project.status !== 'ongoing') {
      return res.status(400).json({ message: 'Can only update status for ongoing projects' });
    }

    await projectRef.update({
      taskStatus,
      updatedAt: new Date().toISOString()
    });

    res.json({ 
      success: true, 
      message: 'Task status updated successfully' 
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Failed to update task status' });
  }
};

export { updateTaskStatus };
