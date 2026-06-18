import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  addManagedStudent,
  getCollegeDashboard,
  getGroupedCollegeNotifications,
  getManagedStudentInsights,
  getManagedStudents,
  notifyEligibleForAllStudents,
  notifyEligibleForStudent,
  uploadManagedStudentsCsv
} from '../services/collegeService';

const initialForm = {
  name: '',
  contactEmail: '',
  collegeName: '',
  tenthMarks: 0,
  twelfthMarks: 0,
  cgpa: 0,
  annualIncome: 0,
  category: 'GENERAL',
  phoneNumber: '',
  gender: '',
  institutionName: '',
  department: '',
  course: '',
  yearOfStudy: 1,
  disability: false,
  sports: false,
  exService: false
};

const CollegeManagementDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [notifyingAll, setNotifyingAll] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [groupedNotifications, setGroupedNotifications] = useState([]);
  const [expandedNotificationGroups, setExpandedNotificationGroups] = useState({});

  const highestCgpaStudent = [...students].sort((left, right) => (right.cgpa || 0) - (left.cgpa || 0))[0];
  const lowestIncomeStudent = [...students].sort((left, right) => (left.annualIncome || 0) - (right.annualIncome || 0))[0];
  const emailCoverage = stats?.totalManagedStudents ? Math.round(((stats?.studentsWithEmail || 0) / stats.totalManagedStudents) * 100) : 0;

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, dashboardRes] = await Promise.all([
        getManagedStudents(),
        getCollegeDashboard()
      ]);

      if (studentsRes.success) setStudents(studentsRes.data || []);
      if (dashboardRes.success) setStats(dashboardRes.data);

      const notificationRes = await getGroupedCollegeNotifications();
      if (notificationRes.success) {
        setGroupedNotifications(notificationRes.data || []);
      }
    } catch (error) {
      toast.error('Unable to load college dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        annualIncome: Number(formData.annualIncome),
        cgpa: Number(formData.cgpa),
        tenthMarks: Number(formData.tenthMarks),
        twelfthMarks: Number(formData.twelfthMarks),
        yearOfStudy: formData.yearOfStudy ? Number(formData.yearOfStudy) : null
      };

      const response = await addManagedStudent(payload);
      if (response.success) {
        toast.success('Student added successfully');
        setFormData(initialForm);
        await loadData();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add student');
    } finally {
      setSaving(false);
    }
  };

  const handleNotifyOne = async (studentId, studentName) => {
    try {
      const response = await notifyEligibleForStudent(studentId);
      if (response.success) {
        const count = response.data?.eligibleScholarshipCount || 0;
        toast.success(`${studentName}: ${count} eligibility alerts processed`);
      }
    } catch (error) {
      toast.error(`Failed to notify for ${studentName}`);
    }
  };

  const handleNotifyAll = async () => {
    setNotifyingAll(true);
    try {
      const response = await notifyEligibleForAllStudents();
      if (response.success) {
        const totalMatches = (response.data || []).reduce(
          (acc, item) => acc + (item.eligibleScholarshipCount || 0),
          0
        );
        toast.success(`Eligibility scan completed. Total matches: ${totalMatches}`);
      }
    } catch (error) {
      toast.error('Failed to run eligibility scan for all students');
    } finally {
      setNotifyingAll(false);
    }
  };

  const handleViewInsights = async (studentId) => {
    setSelectedStudentId(studentId);
    setInsightLoading(true);
    try {
      const response = await getManagedStudentInsights(studentId);
      if (response.success) {
        setSelectedInsight(response.data);
      }
    } catch (error) {
      toast.error('Failed to load student insights');
    } finally {
      setInsightLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const sample = [
      'name,contactEmail,collegeName,tenthMarks,twelfthMarks,cgpa,annualIncome,category,phoneNumber,gender,institutionName,department,course,yearOfStudy,disability,sports,exService',
      'Ravi Kumar,ravi@example.com,SKCT,89,92,8.4,180000,OBC,9876543210,MALE,SKCT,CSE,B.Tech,3,false,true,false'
    ].join('\n');

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'college_students_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadCsv = async () => {
    if (!uploadFile) {
      toast.warning('Please select a CSV file first');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadManagedStudentsCsv(uploadFile);
      if (res.success) {
        const data = res.data;
        toast.success(`Upload completed: ${data.successCount} success, ${data.failedCount} failed`);
        if (data.errors?.length) {
          toast.warning(`Some rows failed. First error: ${data.errors[0]}`);
        }
        setUploadFile(null);
        await loadData();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'CSV upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="content-area d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="enhanced-dashboard">
      <div className="student-header">
        <div>
          <h1 className="student-title">Student Management</h1>
          <p className="student-subtitle">
            Manage students and trigger scholarship eligibility alerts
          </p>
        </div>

        <button
          className="btn-primary-modern"
          onClick={handleNotifyAll}
          disabled={notifyingAll}
        >
          {notifyingAll ? "Running Scan..." : "Notify Eligible Students"}
        </button>
      </div>

      <div className="stats-grid-enhanced">
        <div className="student-stats-grid">
          <div className="student-stat-card">
            <span className="stat-label">Managed Students</span>
            <span className="stat-number">{stats?.totalManagedStudents || 0}</span>
          </div>

          <div className="student-stat-card">
            <span className="stat-label">Students With Email</span>
            <span className="stat-number">{stats?.studentsWithEmail || 0}</span>
          </div>

          <div className="student-stat-card">
            <span className="stat-label">Ready To Apply</span>
            <span className="stat-number">{stats?.studentsReadyForApplications || 0}</span>
          </div>

          <div className="student-stat-card">
            <span className="stat-label">Students With Documents</span>
            <span className="stat-number">{stats?.studentsWithDocuments || 0}</span>
          </div>

          <div className="student-stat-card">
            <span className="stat-label">Eligible Matches</span>
            <span className="stat-number">{stats?.totalEligibleScholarships || 0}</span>
          </div>
        </div>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-lg-4">
          <div className="dashboard-card h-100">
            <div className="small text-muted mb-2">Top Academic Performer</div>
            <div className="h4 mb-1">{highestCgpaStudent?.name || 'No data'}</div>
            <div className="text-muted small">CGPA: {highestCgpaStudent?.cgpa ?? '-'}</div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="dashboard-card h-100">
            <div className="small text-muted mb-2">Highest Need Candidate</div>
            <div className="h4 mb-1">{lowestIncomeStudent?.name || 'No data'}</div>
            <div className="text-muted small">Annual Income: {lowestIncomeStudent?.annualIncome ?? '-'}</div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="dashboard-card h-100">
            <div className="small text-muted mb-2">Email Coverage</div>
            <div className="display-6 fw-semibold mb-1">{emailCoverage}%</div>
            <div className="text-muted small">Students reachable for scholarship alerts</div>
          </div>
        </div>
      </div>

      <div className="dashboard-card-modern">
        <h4 className="section-title">Bulk Upload Students</h4>
        <p className="section-subtitle">
          Upload multiple students using a CSV file.
        </p>

        <div className="upload-row">
          <input
            type="file"
            accept=".csv"
            className="file-input-modern"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          />

          <button
            className="btn-outline-modern"
            onClick={handleDownloadTemplate}
          >
            Download Template
          </button>

          <button
            className="btn-primary-modern"
            onClick={handleUploadCsv}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload CSV"}
          </button>
        </div>
      </div>

      <div className="dashboard-card mt-4">
        <h5 className="mb-3">Add Student</h5>
        <form onSubmit={handleCreateStudent}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Name</label>
              <input className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Student Email</label>
              <input type="email" className="form-control" name="contactEmail" value={formData.contactEmail} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">College Name</label>
              <input className="form-control" name="collegeName" value={formData.collegeName} onChange={handleChange} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">10th Marks</label>
              <input type="number" step="0.01" className="form-control" name="tenthMarks" value={formData.tenthMarks} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">12th Marks</label>
              <input type="number" step="0.01" className="form-control" name="twelfthMarks" value={formData.twelfthMarks} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">CGPA</label>
              <input type="number" step="0.01" className="form-control" name="cgpa" value={formData.cgpa} onChange={handleChange} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Annual Income</label>
              <input type="number" step="0.01" className="form-control" name="annualIncome" value={formData.annualIncome} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <select className="form-select" name="category" value={formData.category} onChange={handleChange}>
                <option value="GENERAL">GENERAL</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Phone Number</label>
              <input className="form-control" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Gender</label>
              <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Male">MALE</option>
                <option value="Female">FEMALE</option>
                <option value="Other">OTHER</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Institution</label>
              <input className="form-control" name="institutionName" value={formData.institutionName} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Department</label>
              <input className="form-control" name="department" value={formData.department} onChange={handleChange} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Course</label>
              <input className="form-control" name="course" value={formData.course} onChange={handleChange} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Year of Study</label>
              <select className="form-select" name="yearOfStudy" value={formData.yearOfStudy || 1} onChange={handleChange}>
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>5th Year</option>
                <option value={6}>6th Year</option>
              </select>
            </div>
            <div className="col-md-8 d-flex align-items-end gap-3">
              <div className="form-check">
                <input id="disability" className="form-check-input" type="checkbox" name="disability" checked={formData.disability} onChange={handleChange} />
                <label className="form-check-label" htmlFor="disability">Disability</label>
              </div>
              <div className="form-check">
                <input id="sports" className="form-check-input" type="checkbox" name="sports" checked={formData.sports} onChange={handleChange} />
                <label className="form-check-label" htmlFor="sports">Sports</label>
              </div>
              <div className="form-check">
                <input id="exService" className="form-check-input" type="checkbox" name="exService" checked={formData.exService} onChange={handleChange} />
                <label className="form-check-label" htmlFor="exService">Ex-Service</label>
              </div>
            </div>
            <div className="col-12">
              <button className="btn-primary-modern" disabled={saving}>
                {saving ? 'Saving...' : 'Add Student'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="dashboard-card mt-4">
        <h5 className="mb-3">Managed Students</h5>
        {students.length === 0 ? (
          <p className="text-muted">No student records yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>CGPA</th>
                  <th>Income</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.contactEmail || '-'}</td>
                    <td>{student.cgpa ?? '-'}</td>
                    <td>{student.annualIncome}</td>
                    <td>{student.category || '-'}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => handleViewInsights(student.id)}
                        >
                          {selectedStudentId === student.id && insightLoading ? 'Loading...' : 'View Insights'}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleNotifyOne(student.id, student.name)}
                        >
                          Notify Eligible Scholarships
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard-card mt-4">
        <h5 className="mb-3">Notifications Grouped By Student</h5>
        {groupedNotifications.length === 0 ? (
          <p className="text-muted mb-0">No grouped eligibility notifications available yet.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {groupedNotifications.map((group, index) => {
              const groupKey = `${group.studentId || 'student'}-${index}`;
              const isExpanded = Boolean(expandedNotificationGroups[groupKey]);
              return (
                <div className="border rounded-4 p-3" key={groupKey}>
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                    <div>
                      <div className="fw-semibold mb-1">{group.studentName || 'Unknown Student'}</div>
                      <div className="small text-muted mb-2">Student Email: {group.studentEmail || 'Not available'}</div>
                      <div className="d-flex gap-2 flex-wrap">
                        <span className="badge bg-primary">{group.totalNotifications} scholarships</span>
                        <span className="badge bg-warning text-dark">{group.unreadNotifications} unread</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm fw-semibold"
                      onClick={() => setExpandedNotificationGroups((current) => ({ ...current, [groupKey]: !isExpanded }))}
                    >
                      {isExpanded ? 'Hide Eligible Scholarships' : 'View Eligible Scholarships'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="table-responsive mt-3">
                      <table className="table table-sm align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Scholarship</th>
                            <th>Latest Update</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(group.notifications || []).map((item) => (
                            <tr key={item.id || `${item.scholarshipId}-${item.scholarshipTitle}`}>
                              <td>{item.scholarshipTitle || item.message}</td>
                              <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</td>
                              <td>{item.isRead ? 'Read' : 'Unread'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dashboard-card mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Student Insights</h5>
          {selectedInsight && <span className="badge bg-light text-dark">{selectedInsight.studentName}</span>}
        </div>

        {!selectedInsight && !insightLoading && (
          <p className="text-muted mb-0">Select a managed student to view recommendation quality, readiness, and missing items.</p>
        )}

        {insightLoading && (
          <div className="d-flex align-items-center gap-2 text-muted">
            <div className="spinner-border spinner-border-sm" role="status" />
            <span>Loading insights...</span>
          </div>
        )}

        {selectedInsight && !insightLoading && (
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="border rounded-4 p-3 h-100 bg-light text-dark">
                <div className="small text-secondary mb-2">Profile Readiness</div>
                <div className="display-6 fw-semibold mb-2 text-dark">{selectedInsight.profileStrength?.overallScore || 0}%</div>
                <div className="mb-2 text-dark"><strong>{selectedInsight.profileStrength?.strengthLevel || 'UNKNOWN'}</strong></div>
                <div className="text-dark small mb-3">
                  {selectedInsight.profileStrength?.overallMessage || 'No profile summary available.'}
                </div>
                <div className="small text-dark"><strong>Completeness:</strong> {selectedInsight.profileStrength?.completenessPercentage || 0}%</div>
                <div className="small text-dark"><strong>Ready:</strong> {selectedInsight.readyForApplications ? 'Yes' : 'No'}</div>
                <div className="small text-dark"><strong>Documents:</strong> {selectedInsight.documentCount || 0}</div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="border rounded-4 p-3 h-100 bg-light text-dark">
                <div className="small text-secondary mb-2">Scholarship Outlook</div>
                <div className="display-6 fw-semibold mb-2 text-dark">{selectedInsight.eligibleScholarshipCount || 0}</div>
                <div className="small mb-2 text-dark">Eligible scholarships</div>
                <div className="small mb-2 text-dark"><strong>High-match opportunities:</strong> {selectedInsight.highMatchScholarshipCount || 0}</div>
                <div className="small mb-3 text-dark"><strong>Email:</strong> {selectedInsight.contactEmail || 'Not provided'}</div>
                <div className="small text-secondary">Uploaded document types</div>
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {(selectedInsight.documentTypes || []).length > 0 ? (
                    selectedInsight.documentTypes.map((type) => (
                      <span key={type} className="badge bg-primary text-white border">{type}</span>
                    ))
                  ) : (
                    <span className="text-secondary small">No documents uploaded yet</span>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="border rounded-4 p-3 h-100 bg-light text-dark">
                <div className="small text-secondary mb-2">Action Items</div>
                {(selectedInsight.profileStrength?.suggestions || []).length > 0 ? (
                  <ul className="mb-0 ps-3 text-dark">
                    {selectedInsight.profileStrength.suggestions.map((suggestion) => (
                      <li key={suggestion} className="small mb-2 text-dark">{suggestion}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="small text-dark mb-0">No major gaps detected for this student.</p>
                )}
              </div>
            </div>

            <div className="col-12">
              <div className="border rounded-4 p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Top Scholarship Recommendations</h6>
                  <span className="text-muted small">Top 5 ranked matches</span>
                </div>

                {(selectedInsight.topRecommendations || []).length > 0 ? (
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Scholarship</th>
                          <th>Match</th>
                          <th>Eligibility</th>
                          <th>Category</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInsight.topRecommendations.map((item) => (
                          <tr key={item.scholarshipId}>
                            <td>
                              <div className="fw-semibold">{item.title}</div>
                              <div className="small text-muted">{item.eligibilityMessage}</div>
                            </td>
                            <td>{item.matchScore}%</td>
                            <td>{item.isEligible ? 'Eligible' : 'Not eligible yet'}</td>
                            <td>{item.category || '-'}</td>
                            <td>{item.amount ? `₹${item.amount}` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted mb-0">No recommendation data available for this student.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeManagementDashboard;
