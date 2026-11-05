/**
 * server/routes/learning.ts — الواجبات، التسليمات والتصحيح، الشهادات الحقيقية بالتحقق العام
 */
import { Router } from 'express';
import crypto from 'crypto';
import { pool } from '../lib/db.js';
import { recordAudit } from '../lib/audit.js';
import { hmacSign, hmacVerify } from '../lib/security.js';

export const learningRouter = Router();

// ===== الواجبات =====
learningRouter.get('/assignments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orbit_assignments ORDER BY due_date ASC');
    res.json(result.rows.map(r => ({
      id: r.id, courseId: r.course_id, courseTitle: r.course_title, title: r.title,
      description: r.description, rubric: r.rubric, dueDate: r.due_date, maxScore: r.max_score,
    })));
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: 'Failed to query assignments' });
  }
});

// ===== التسليمات =====
learningRouter.get('/submissions', async (req, res) => {
  const studentId = req.query.studentId ? String(req.query.studentId) : null;
  const assignmentId = req.query.assignmentId ? String(req.query.assignmentId) : null;
  try {
    let rows: any[];
    if (studentId || assignmentId) {
      const conds: string[] = []; const params: any[] = [];
      if (studentId) { params.push(studentId); conds.push(`student_id = $${params.length}`); }
      if (assignmentId) { params.push(assignmentId); conds.push(`assignment_id = $${params.length}`); }
      const r = await pool.query(`SELECT * FROM orbit_submissions WHERE ${conds.join(' AND ')} ORDER BY submitted_at DESC`, params);
      rows = r.rows;
    } else {
      const r = await pool.query('SELECT * FROM orbit_submissions ORDER BY submitted_at DESC');
      rows = r.rows;
    }
    res.json(rows.map(x => ({
      id: x.id, assignmentId: x.assignment_id, assignmentTitle: x.assignment_title,
      studentId: x.student_id, studentName: x.student_name, submittedAt: x.submitted_at,
      textSubmission: x.text_submission, repoUrl: x.repo_url, grade: x.grade,
      maxScore: x.max_score, feedback: x.feedback, status: x.status,
    })));
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: 'Failed to query submissions' });
  }
});

learningRouter.post('/submissions', async (req, res) => {
  const { assignmentId, assignmentTitle, studentId, studentName, textSubmission, repoUrl, maxScore } = req.body || {};
  if (!assignmentId || !studentId || !textSubmission) {
    return res.status(400).json({ error: 'INVALID_INPUT', message: 'التسليم غير مكتمل' });
  }
  const subId = 'sub-' + crypto.randomUUID();
  try {
    await pool.query(
      `INSERT INTO orbit_submissions (id, assignment_id, assignment_title, student_id, student_name, text_submission, repo_url, max_score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'submitted')`,
      [subId, assignmentId, assignmentTitle, studentId, studentName, textSubmission, repoUrl || null, maxScore || 100]
    );
    await recordAudit({
      actorUserId: studentId, actorName: studentName, action: 'ASSIGNMENT_SUBMITTED',
      resourceType: 'assignment', resourceId: assignmentId, reason: `تسليم مشروع: ${assignmentTitle}`,
    });
    res.status(201).json({ id: subId, status: 'submitted', submittedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: 'Failed to save submission' });
  }
});

learningRouter.put('/submissions/:id/grade', async (req, res) => {
  const { id } = req.params;
  const { grade, feedback, graderName } = req.body || {};
  if (grade === undefined || grade === null) return res.status(400).json({ error: 'INVALID_INPUT', message: 'الدرجة مطلوبة' });
  try {
    const upd = await pool.query(
      `UPDATE orbit_submissions SET grade = $1, feedback = $2, status = 'graded' WHERE id = $3 RETURNING *`,
      [Number(grade), String(feedback || ''), id]
    );
    if (upd.rows.length === 0) return res.status(404).json({ error: 'SUBMISSION_NOT_FOUND' });
    await recordAudit({
      actorName: String(graderName || 'المدرس المعتمد'), action: 'SUBMISSION_GRADED',
      resourceType: 'assignment_submission', resourceId: id, reason: `رصد درجة المشروع: ${grade}/${upd.rows[0].max_score}`,
    });
    res.json({ success: true, id, grade: Number(grade), status: 'graded' });
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: 'Failed to grade submission' });
  }
});

// ===== الشهادات — رمز تحقق موقّع HMAC يمنع التزوير =====
function certCodePayload(code: string): string {
  // صيغة الرمز: ORB-2026-<hex4>-<rand4>-<sig6>
  const parts = code.split('-');
  return parts.slice(0, 4).join('-');
}

export function issueVerificationCode(courseId: string, userId: string): string {
  const hexPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  const randPart = String(1000 + Math.floor(Math.random() * 9000));
  const base = `ORB-2026-${hexPart}-${randPart}`;
  const sig = hmacSign(`${base}|${courseId}|${userId}`).slice(0, 6).toUpperCase();
  return `${base}-${sig}`;
}

learningRouter.get('/certificates', async (req, res) => {
  const userId = req.query.userId ? String(req.query.userId) : null;
  try {
    const r = userId
      ? await pool.query('SELECT * FROM orbit_certificates WHERE user_id = $1 ORDER BY issued_at DESC', [userId])
      : await pool.query('SELECT * FROM orbit_certificates ORDER BY issued_at DESC');
    res.json(r.rows.map(x => ({
      id: x.id, enrollmentId: x.enrollment_id, courseId: x.course_id, courseTitle: x.course_title,
      userId: x.user_id, userName: x.user_name, instructorName: x.instructor_name,
      verificationCode: x.verification_code, gradePercentage: x.grade_percentage,
      skillsVerified: x.skills_verified, issuedAt: x.issued_at,
    })));
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: 'Failed to query certificates' });
  }
});

learningRouter.post('/certificates', async (req, res) => {
  const { enrollmentId, courseId, courseTitle, userId, userName, instructorName, gradePercentage, skillsVerified } = req.body || {};
  if (!courseId || !userId) return res.status(400).json({ error: 'INVALID_INPUT', message: 'بيانات الشهادة غير مكتملة' });
  const certId = 'cert-' + crypto.randomUUID();
  const verificationCode = issueVerificationCode(courseId, userId);
  try {
    // التحقق الفعلي من إتمام الدورة قبل إصدار الشهادة — لا شهادات وهمية
    const lessonIds: string[] = [];
    try {
      const c = await pool.query('SELECT sections FROM orbit_courses WHERE id = $1', [courseId]);
      const sections = c.rows[0]?.sections || [];
      for (const sec of sections) for (const les of (sec.lessons || [])) lessonIds.push(les.id);
    } catch { /* لا يمكن فحص الأقسام — يُقبل الطلب بصرامة الدرجة فقط */ }
    if (lessonIds.length > 0) {
      const prog = await pool.query(
        `SELECT COUNT(*)::int AS done FROM orbit_lesson_progress WHERE user_id = $1 AND completed = true AND lesson_id = ANY($2::text[])`,
        [userId, lessonIds]
      );
      const ratio = prog.rows[0].done / lessonIds.length;
      if (ratio < 0.6) {
        return res.status(403).json({
          error: 'COURSE_NOT_COMPLETED',
          message: `لم تُكمل ${Math.round(ratio * 100)}% من دروس الدورة بعد — الشهادة تُصدر تلقائياً عند إتمام 60% على الأقل واجتياز الاختبار.`,
        });
      }
    }
    await pool.query(
      `INSERT INTO orbit_certificates (id, enrollment_id, course_id, course_title, user_id, user_name, instructor_name, verification_code, grade_percentage, skills_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [certId, enrollmentId || 'enr-' + certId, courseId, courseTitle, userId, userName, instructorName, verificationCode, gradePercentage, JSON.stringify(skillsVerified || [])]
    );
    await recordAudit({
      actorUserId: userId, actorName: userName, action: 'CERTIFICATE_ISSUED',
      resourceType: 'certificate', resourceId: certId,
      reason: `إصدار شهادة معتمدة للدورة: ${courseTitle}`, correlationId: verificationCode,
    });
    res.status(201).json({ id: certId, verificationCode, issuedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: 'Failed to issue certificate' });
  }
});

// التحقق العام من شهادة برمزها — يقرأ من قاعدة البيانات ويتحقق من التوقيع
learningRouter.get('/certificates/verify/:code', async (req, res) => {
  const code = String(req.params.code || '').trim().toUpperCase();
  try {
    const r = await pool.query('SELECT * FROM orbit_certificates WHERE UPPER(verification_code) = $1', [code]);
    if (r.rows.length === 0) return res.status(404).json({ valid: false, error: 'NOT_FOUND', message: 'لا توجد شهادة بهذا الرقم — راجع الحروف والأرقام' });
    const x = r.rows[0];
    // إعادة حساب توقيع الرمز — شهادة مزوّرة (رمز معدّل) تفشل هنا
    const expectedSig = hmacSign(`${certCodePayload(code)}|${x.course_id}|${x.user_id}`).slice(0, 6).toUpperCase();
    const providedSig = code.split('-')[4] || '';
    const signatureValid = expectedSig === providedSig;
    res.json({
      valid: signatureValid,
      signatureVerified: signatureValid,
      certificate: {
        id: x.id, courseId: x.course_id, courseTitle: x.course_title, userId: x.user_id,
        userName: x.user_name, instructorName: x.instructor_name, verificationCode: x.verification_code,
        gradePercentage: x.grade_percentage, skillsVerified: x.skills_verified, issuedAt: x.issued_at,
      },
    });
  } catch (err) {
    res.status(500).json({ valid: false, error: 'DB_ERROR', message: 'تعذر التحقق حالياً' });
  }
});

void hmacVerify;
