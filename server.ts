import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  app.post('/api/evaluate', async (req, res) => {
    try {
      const { question, subject, maxMarks, answer } = req.body;

      if (!question || !subject || !maxMarks || !answer) {
        return res.status(400).json({ error: 'Missing required fields: question, subject, max marks, and answer are required.' });
      }

      const prompt = `
You are a strict CBSE Class 9 & 10 board examiner.

Your job is to evaluate the student's answer strictly based on:
1. Actual content written by the student (do not add extra points the student did not write)
2. NCERT concepts and CBSE marking scheme style
3. Completeness, accuracy, and structure

Context:
Subject: ${subject}
Question: ${question}
Maximum Marks: ${maxMarks}
Student's Written Answer: ${answer}

Rules you must follow:
- Give marks only for points that are clearly present in the student's answer.
- If the answer is incomplete or missing key points, give partial marks.
- Never give full marks to incomplete or very short answers.
- Do not hallucinate or assume the student knows something they did not write.
- Be slightly strict (like a real board examiner).
- In "How to Improve", give specific, actionable suggestions.
- Clearly mention which important points were missing.
- In "marksLostExplanation", give honest reasons why marks were lost.
- In "generalFeedback", provide concise 2-3 lines of honest board examiner feedback.
- Scoring Point Analysis: List the key expected points and mark each strictly as MET, PARTIAL, or MISSING with an explanation.
- Answer Structure: Rate introduction, body, and conclusion as Good, Strong, Average, or Needs Work.
- Provide a realistic CBSE Marks Breakdown array mapping criteria to marks scored and max score (sum of maxScores should equal ${maxMarks}).
- Provide an ideal Model Answer tailored specifically for this question to help the student understand full marks (${maxMarks}/${maxMarks}) standard.
- Set confidenceLevel strictly to HIGH, MEDIUM, or LOW based on answer clarity, and confidencePercentage between 70 and 98.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING, description: 'Short concise topic title, e.g. Photosynthesis & Stomata' },
          scoreSummary: { type: Type.STRING, description: 'Short evaluation headline, e.g. Very Good Answer' },
          estimatedScore: { type: Type.NUMBER, description: 'The estimated score out of the maximum marks.' },
          marksBreakdown: {
            type: Type.ARRAY,
            description: 'Breakdown of marks per key concept or rubric criterion.',
            items: {
              type: Type.OBJECT,
              properties: {
                criterion: { type: Type.STRING, description: 'Criterion or concept name' },
                score: { type: Type.NUMBER, description: 'Marks awarded for this criterion' },
                maxScore: { type: Type.NUMBER, description: 'Max marks possible for this criterion' }
              },
              required: ['criterion', 'score', 'maxScore']
            }
          },
          scoringPoints: {
            type: Type.ARRAY,
            description: 'Analysis of important points expected in the answer.',
            items: {
              type: Type.OBJECT,
              properties: {
                point: { type: Type.STRING, description: 'The expected point.' },
                status: { type: Type.STRING, description: 'One of: MET, PARTIALLY MET, MISSING' },
                explanation: { type: Type.STRING, description: 'Explanation of why it was evaluated this way.' }
              },
              required: ['point', 'status', 'explanation']
            }
          },
          missingConcepts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'A list of concepts the student missed.'
          },
          marksLostExplanation: { type: Type.STRING, description: 'Detailed explanation of why marks were lost, if any.' },
          structureScore: {
            type: Type.OBJECT,
            description: 'Answer structure evaluation breakdown',
            properties: {
              introduction: { type: Type.STRING, description: 'Good, Strong, Average, or Needs Work' },
              body: { type: Type.STRING, description: 'Good, Strong, Average, or Needs Work' },
              conclusion: { type: Type.STRING, description: 'Good, Strong, Average, or Needs Work' }
            },
            required: ['introduction', 'body', 'conclusion']
          },
          improvementSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Actionable suggestions for the student to improve.'
          },
          confidenceLevel: { type: Type.STRING, description: 'Confidence in this evaluation: HIGH, MEDIUM, LOW.' },
          confidencePercentage: { type: Type.NUMBER, description: 'Percentage confidence between 85 and 99, e.g. 92' },
          generalFeedback: { type: Type.STRING, description: 'General feedback to the student.' },
          modelAnswer: { type: Type.STRING, description: 'Complete ideal model answer for full marks.' }
        },
        required: ['topic', 'scoreSummary', 'estimatedScore', 'marksBreakdown', 'scoringPoints', 'missingConcepts', 'marksLostExplanation', 'improvementSuggestions', 'confidenceLevel', 'generalFeedback', 'modelAnswer']
      };

      // Candidate models for evaluation, prioritizing ultra-reliable high-availability flash-lite
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      let lastError: any = null;
      let responseText: string | undefined;

      for (const modelName of candidateModels) {
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
          try {
            attempts++;
            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                responseSchema,
              }
            });

            responseText = response.text;
            if (responseText) {
              break; // Success!
            }
          } catch (err: any) {
            lastError = err;
            console.warn(`Attempt ${attempts} with model ${modelName} failed:`, err?.message || err);
            // Check if 503, UNAVAILABLE, or 429
            const isTransient = err?.status === 'UNAVAILABLE' || err?.message?.includes('503') || err?.message?.includes('high demand') || err?.message?.includes('429');
            if (isTransient && attempts < maxAttempts) {
              // Wait 1.5 seconds before retrying
              await new Promise((resolve) => setTimeout(resolve, 1500));
            } else {
              break;
            }
          }
        }

        if (responseText) {
          break;
        }
      }

      if (!responseText) {
        if (lastError?.message?.includes('503') || lastError?.message?.includes('high demand') || lastError?.status === 'UNAVAILABLE') {
          return res.status(503).json({
            error: 'The AI evaluation service is currently experiencing high demand. Please wait a few moments and click "Check My Answer" again.'
          });
        }
        throw lastError || new Error('Failed to generate evaluation response');
      }

      // Clean JSON string if enclosed in markdown code blocks
      let cleanJson = responseText.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      }

      const rawEvaluation = JSON.parse(cleanJson);

      // Normalize status and confidence values for frontend display
      const normalizedScoringPoints = Array.isArray(rawEvaluation.scoringPoints)
        ? rawEvaluation.scoringPoints.map((sp: any) => {
            let status = (sp.status || 'PARTIALLY MET').toUpperCase().trim();
            if (status.includes('PARTIAL')) status = 'PARTIALLY MET';
            else if (status.includes('MISS')) status = 'MISSING';
            else if (status.includes('MET')) status = 'MET';
            else status = 'PARTIALLY MET';

            return {
              point: String(sp.point || 'Marking point'),
              status,
              explanation: String(sp.explanation || ''),
            };
          })
        : [];

      let confidenceLevel = (rawEvaluation.confidenceLevel || 'MEDIUM').toUpperCase().trim();
      if (!['HIGH', 'MEDIUM', 'LOW'].includes(confidenceLevel)) {
        confidenceLevel = confidenceLevel.includes('HIGH') ? 'HIGH' : confidenceLevel.includes('LOW') ? 'LOW' : 'MEDIUM';
      }

      const maxM = Number(maxMarks) || 5;
      const estimatedScore = Math.min(maxM, Math.max(0, Number(rawEvaluation.estimatedScore) || 0));

      const normalizedMarksBreakdown = Array.isArray(rawEvaluation.marksBreakdown)
        ? rawEvaluation.marksBreakdown.map((item: any) => ({
            criterion: String(item.criterion || 'Criterion'),
            score: Number(item.score) || 0,
            maxScore: Number(item.maxScore) || 1,
          }))
        : [];

      const structureScore = {
        introduction: String(rawEvaluation.structureScore?.introduction || (estimatedScore >= maxM * 0.7 ? 'Good' : 'Average')),
        body: String(rawEvaluation.structureScore?.body || (estimatedScore >= maxM * 0.6 ? 'Strong' : 'Needs Detail')),
        conclusion: String(rawEvaluation.structureScore?.conclusion || (estimatedScore >= maxM * 0.8 ? 'Good' : 'Average')),
      };

      const confidencePercentage = Math.round(
        Number(rawEvaluation.confidencePercentage) ||
        (confidenceLevel === 'HIGH' ? 92 : confidenceLevel === 'MEDIUM' ? 84 : 72)
      );

      const evaluation = {
        topic: String(rawEvaluation.topic || `${subject} Evaluation`),
        scoreSummary: String(rawEvaluation.scoreSummary || (estimatedScore >= maxM * 0.8 ? 'Very Good Answer' : estimatedScore >= maxM * 0.5 ? 'Good Attempt' : 'Needs Improvement')),
        estimatedScore,
        marksBreakdown: normalizedMarksBreakdown,
        structureScore,
        scoringPoints: normalizedScoringPoints,
        missingConcepts: Array.isArray(rawEvaluation.missingConcepts) ? rawEvaluation.missingConcepts : [],
        marksLostExplanation: String(rawEvaluation.marksLostExplanation || ''),
        improvementSuggestions: Array.isArray(rawEvaluation.improvementSuggestions) ? rawEvaluation.improvementSuggestions : [],
        confidenceLevel,
        confidencePercentage,
        generalFeedback: String(rawEvaluation.generalFeedback || ''),
        modelAnswer: String(rawEvaluation.modelAnswer || ''),
      };

      res.json(evaluation);
    } catch (error: any) {
      console.error('Error evaluating answer:', error);
      res.status(500).json({
        error: error?.message || 'Failed to evaluate answer. Please verify your inputs and try again.'
      });
    }
  });

  // Discuss Mode endpoint for CBSE Class 9 & 10 Study Mentor
  app.post('/api/discuss', async (req, res) => {
    try {
      const { question, subject, maxMarks, studentAnswer, evaluation, messages } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages are required for discussion.' });
      }

      const systemInstruction = `
You are "Discuss Mode" of AnswerCheck AI – a friendly, strict-but-supportive CBSE Class 9 & 10 study mentor.

CONTEXT YOU ALREADY HAVE:
- Subject: ${subject || 'CBSE Subject'}
- Exact CBSE Board Question: ${question || 'Question not specified'}
- Maximum Marks: ${maxMarks || 5}
- Student's Written Answer: ${studentAnswer || 'Answer not provided'}

PREVIOUS EVALUATION (marks, strengths, weaknesses, concept gaps, structure feedback):
- Estimated Score: ${evaluation?.estimatedScore ?? 'N/A'} / ${maxMarks || 5}
- Score Summary: ${evaluation?.scoreSummary || 'N/A'}
- Examiner General Feedback: ${evaluation?.generalFeedback || 'N/A'}
- Why Marks Were Lost (Honest Examiner Reasons): ${evaluation?.marksLostExplanation || 'None reported'}
- Important Points Missing: ${(evaluation?.missingConcepts || []).join(', ') || 'None'}
- Scoring Point Analysis:
${(evaluation?.scoringPoints || []).map((p: any) => `  * [${p.status}] ${p.point}: ${p.explanation}`).join('\n') || 'None'}
- Structure Score: Intro: ${evaluation?.structureScore?.introduction || 'N/A'}, Body: ${evaluation?.structureScore?.body || 'N/A'}, Conclusion: ${evaluation?.structureScore?.conclusion || 'N/A'}
- Actionable Improvement Suggestions: ${(evaluation?.improvementSuggestions || []).join('; ') || 'N/A'}
- CBSE Model Answer Standard (Full Marks): ${evaluation?.modelAnswer || 'N/A'}

YOUR ROLE:
After the evaluation is done, the student wants to discuss the answer with you.
Be like a cool senior + strict teacher mixed.

RULES FOR DISCUSSION:
1. Always stay focused on the given question and the student's answer. Do not go off-topic.
2. Speak in simple Hindi + English mix (Hinglish) so Class 9-10 students feel comfortable. Use pure English only if student asks.
3. First understand what the student is asking, then reply.
4. Teach concepts deeply but simply – use real-life examples, diagrams description, and step-by-step reasoning.
5. If student is confused about a concept → explain it from basics with CBSE level language.
6. If student wants better answer writing → show improved version of their own answer (not completely new answer) and explain why it is better (keywords, structure, diagrams, value points).
7. Encourage critical thinking – ask small follow-up questions sometimes.
8. Never give full ready-made answers for new questions. Guide them to think.
9. Be honest – if their concept is weak, tell them clearly but motivationally.
10. Keep replies short and clear (not too long paragraphs). Use bullet points when helpful.
11. End every reply with one small action or question so discussion continues naturally.
12. Remind gently that this is practice – final marks depend on proper writing in board exams.

TONE:
- Friendly & encouraging
- Slightly strict when student is being lazy or missing important points
- Motivational without empty praise
- Always push for 90%+ level answers
`;

      // Filter out the initial static greeting if it's the first message so contents starts with a user turn
      const filteredMessages = messages.filter((m: any, idx: number) => !(idx === 0 && m.role === 'assistant'));
      
      const contents = filteredMessages.length > 0
        ? filteredMessages.map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: String(m.content || '') }],
          }))
        : [{ role: 'user', parts: [{ text: 'Evaluation ho gaya! Can you help me understand how to score better?' }] }];

      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      let lastError: any = null;
      let replyText: string | undefined;

      for (const modelName of candidateModels) {
        let attempts = 0;
        const maxAttempts = 2;

        while (attempts < maxAttempts) {
          try {
            attempts++;
            const response = await ai.models.generateContent({
              model: modelName,
              contents,
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            });

            replyText = response.text;
            if (replyText) {
              break;
            }
          } catch (err: any) {
            lastError = err;
            console.warn(`Attempt ${attempts} in Discuss Mode with model ${modelName} failed:`, err?.message || err);
            const isTransient = err?.status === 'UNAVAILABLE' || err?.message?.includes('503') || err?.message?.includes('high demand') || err?.message?.includes('429');
            if (isTransient && attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 1500));
            } else {
              break;
            }
          }
        }

        if (replyText) {
          break;
        }
      }

      if (!replyText) {
        if (lastError?.message?.includes('503') || lastError?.message?.includes('high demand') || lastError?.status === 'UNAVAILABLE') {
          return res.status(503).json({
            error: 'AI Mentor is currently busy assisting students. Please wait a moment and try asking again.'
          });
        }
        throw lastError || new Error('Failed to generate mentor reply');
      }

      res.json({ reply: replyText });
    } catch (error: any) {
      console.error('Error in Discuss Mode:', error);
      res.status(500).json({
        error: error?.message || 'Failed to get mentor response. Please try again.'
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
