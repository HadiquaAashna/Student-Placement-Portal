import express from 'express';

const router = express.Router();

/**
 * @route   POST /api/chatbot
 * @desc    Get placement bot response (Mock ready for IBM Watson Assistant)
 * @access  Public
 * 
 * IBM Watson Assistant Integration Note:
 * --------------------------------------
 * To fully integrate IBM Watson Assistant:
 * 1. Install the SDK: `npm install ibm-watson`
 * 2. Import the AssistantV2 service:
 *    ```javascript
 *    import AssistantV2 from 'ibm-watson/assistant/v2.js';
 *    import { IamAuthenticator } from 'ibm-watson/auth/index.js';
 *    ```
 * 3. Initialize the assistant instance:
 *    ```javascript
 *    const assistant = new AssistantV2({
 *      version: '2021-11-27',
 *      authenticator: new IamAuthenticator({
 *        apikey: process.env.IBM_WATSON_ASSISTANT_APIKEY,
 *      }),
 *      serviceUrl: process.env.IBM_WATSON_ASSISTANT_SERVICE_URL,
 *    });
 *    ```
 * 4. Create a session (or manage sessions per-user) and send user input message to Watson.
 *    ```javascript
 *    const response = await assistant.message({
 *      assistantId: process.env.IBM_WATSON_ASSISTANT_ID,
 *      sessionId: req.body.sessionId || await createSession(),
 *      input: {
 *        message_type: 'text',
 *        text: req.body.message
 *      }
 *    });
 *    res.json({ reply: response.result.output.generic[0].text });
 *    ```
 */
router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ message: 'Message content is required' });
  }

  const query = message.toLowerCase().trim();

  // =========================================================================
  // IBM Watson Assistant Integration Hook Placeholder
  // =========================================================================
  const isWatsonConfigured = process.env.IBM_WATSON_ASSISTANT_APIKEY && 
                             process.env.IBM_WATSON_ASSISTANT_APIKEY !== 'your_ibm_watson_assistant_apikey';

  if (isWatsonConfigured) {
    console.log('IBM Watson Assistant credentials detected. Directing query to Watson service...');
    // Real integration would run here.
  }

  // Fallback Placement-specific Chatbot logic (dummy replies)
  let reply = '';

  if (query.includes('job') || query.includes('opening') || query.includes('postings') || query.includes('hiring')) {
    reply = "We currently have over 30 active job postings on CampusConnect from 10+ premium recruiters including IBM, TCS, Infosys, and Wipro. Go to the 'Jobs' tab in your dashboard to search, filter by job type/location, and apply instantly.";
  } else if (query.includes('resume') || query.includes('upload') || query.includes('photo') || query.includes('cv')) {
    reply = "You can upload your PDF resume and upload/update your profile picture directly inside the 'Profile' section of your Student Dashboard. Make sure your profile stands out by listing your core technical skills and project repositories.";
  } else if (query.includes('average package') || query.includes('salary') || query.includes('package') || query.includes('lpa')) {
    reply = "This season, the average salary package across campus placements stands at a strong 8.5 LPA, with the highest package reaching 32 LPA from top-tier product recruiters. Core engineering offers hover around 7 LPA.";
  } else if (query.includes('schedule') || query.includes('interview') || query.includes('status') || query.includes('shortlist')) {
    reply = "Interviews are scheduled by respective company HR divisions. You will receive an instant notification in your dashboard and email when a company updates your application status from 'Pending' to 'Shortlisted' or 'Accepted'. Keep checking the 'Applications' tab.";
  } else if (query.includes('cgpa') || query.includes('criteria') || query.includes('eligible')) {
    reply = "Most tier-1 recruiters require a minimum CGPA of 7.0 or 7.5 to apply, and no active backlogs. You can check individual job requirements on the Job Details page before submitting your application.";
  } else if (query.includes('admin') || query.includes('help') || query.includes('support') || query.includes('faculty')) {
    reply = "If you encounter database issues, verification errors, or have billing/recruiter queries, you can reach out directly to the Campus Placement Officer Admin at admin@campusconnect.edu or visit the Placement Cell on Block 3.";
  } else if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('greetings')) {
    reply = "Hello! I am your CampusConnect Placement Assistant chatbot. Ask me about open jobs, how to upload resumes, interview stages, or general recruitment stats!";
  } else {
    reply = "I'm not sure I fully understand your query. I am trained on campus placement statistics, job postings, resume procedures, and dashboard guidelines. Try asking: 'What jobs are open?', 'How do I edit my resume?' or 'What is the average package?'";
  }

  // Simulate server response delay for realism (350ms)
  setTimeout(() => {
    res.json({ reply });
  }, 350);
});

export default router;
