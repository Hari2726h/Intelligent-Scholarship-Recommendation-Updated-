import React, { useState, useEffect } from 'react';
import { getProfile, createOrUpdateProfile } from '../services/studentService';
import { toast } from 'react-toastify';
import { Card, Form, Button, Row, Col, ProgressBar, Spinner, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Loader from '../components/Loader';
import {
  FaUser, FaGraduationCap, FaMoneyBillWave, FaMedal, FaUserGraduate,
  FaChartLine, FaWheelchair, FaTrophy, FaFlag, FaStar, FaCheckCircle,
  FaInfoCircle, FaAward, FaSchool, FaBook
} from 'react-icons/fa';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '', tenthMarks: '', twelfthMarks: '', cgpa: '',
    annualIncome: '', category: '', phoneNumber: '', dateOfBirth: '', gender: '',
    address: '', state: '', district: '', pincode: '', institutionName: '',
    department: '', course: '', yearOfStudy: '', disability: false, sports: false, exService: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error("Could not fetch profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile({
      ...profile,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await createOrUpdateProfile(profile);
      if (res.success) {
        toast.success("Profile saved successfully!");
        setProfile(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    const fields = [
      'name', 'tenthMarks', 'twelfthMarks', 'cgpa', 'annualIncome', 'category',
      'phoneNumber', 'dateOfBirth', 'gender', 'state', 'district', 'institutionName',
      'course', 'yearOfStudy'
    ];
    const filledFields = fields.filter(field => profile[field] && profile[field] !== '');
    const percentage = Math.round((filledFields.length / fields.length) * 100);
    return percentage;
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!profile.name) return 'U';
    const names = profile.name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return profile.name[0].toUpperCase();
  };

  // Get grade color based on percentage
  const getGradeColor = (marks) => {
    if (!marks) return 'rgba(108, 117, 125, 0.2)';
    if (marks >= 90) return 'linear-gradient(135deg, #00c853 0%, #64dd17 100%)';
    if (marks >= 75) return 'linear-gradient(135deg, #2196f3 0%, #00bcd4 100%)';
    if (marks >= 60) return 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)';
    return 'linear-gradient(135deg, #ef5350 0%, #e53935 100%)';
  };

  // Get CGPA color and label
  const getCGPAInfo = (cgpa) => {
    if (!cgpa) return { color: 'rgba(108, 117, 125, 0.2)', label: 'Not Set', percentage: 0 };
    const percentage = (cgpa / 10) * 100;
    if (cgpa >= 9) return { color: 'linear-gradient(135deg, #00c853 0%, #64dd17 100%)', label: 'Outstanding', percentage };
    if (cgpa >= 8) return { color: 'linear-gradient(135deg, #2196f3 0%, #00bcd4 100%)', label: 'Excellent', percentage };
    if (cgpa >= 7) return { color: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)', label: 'Good', percentage };
    if (cgpa >= 6) return { color: 'linear-gradient(135deg, #ff7043 0%, #ff5722 100%)', label: 'Average', percentage };
    return { color: 'linear-gradient(135deg, #ef5350 0%, #e53935 100%)', label: 'Below Average', percentage };
  };

  // Get profile strength status
  const getProfileStrength = () => {
    const percentage = calculateCompletion();
    if (percentage === 100) return { label: 'Complete', color: '#00c853', icon: FaCheckCircle };
    if (percentage >= 75) return { label: 'Strong', color: '#2196f3', icon: FaStar };
    if (percentage >= 50) return { label: 'Good', color: '#ffa726', icon: FaAward };
    return { label: 'Incomplete', color: '#ef5350', icon: FaInfoCircle };
  };

  if (loading) return <Loader />;

  const completionPercentage = calculateCompletion();
  const cgpaInfo = getCGPAInfo(profile.cgpa);
  const profileStrength = getProfileStrength();
  const StrengthIcon = profileStrength.icon;

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="mb-4">
        <h2 className="mb-2 fw-bold gradient-text d-flex align-items-center">
          <div
            className="stat-icon me-3"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            <FaUser style={{ fontSize: '1.5rem', color: '#fff' }} />
          </div>
          Student Profile Management
        </h2>
        <p className="text-muted ms-5 ps-4">Manage your personal, academic, and financial information</p>
      </div>

      <Form onSubmit={handleSubmit}>
        {/* Profile Strength Overview */}
        <Row className="mb-4">
          <Col lg={8}>
            <Card className="modern-card">
              <Card.Body className="p-4">
                <Row className="align-items-center">
                  <Col md={3} className="text-center mb-3 mb-md-0">
                    <div
                      className="mx-auto rounded-circle d-flex align-items-center justify-content-center text-white fw-bold position-relative"
                      style={{
                        width: '120px',
                        height: '120px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '3rem',
                        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.5)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {getInitials()}
                      <div
                        className="position-absolute"
                        style={{
                          bottom: '-5px',
                          right: '-5px',
                          background: profileStrength.color,
                          borderRadius: '50%',
                          width: '35px',
                          height: '35px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '3px solid #1a1d29',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
                        }}
                      >
                        <StrengthIcon style={{ fontSize: '1rem', color: '#fff' }} />
                      </div>
                    </div>
                  </Col>
                  <Col md={9}>
                    <div className="mb-3">
                      <h4 className="gradient-text mb-1 d-flex align-items-center">
                        {profile.name || 'Complete Your Profile'}
                        {completionPercentage === 100 && (
                          <Badge
                            bg="success"
                            className="ms-2"
                            style={{
                              background: 'linear-gradient(135deg, #00c853 0%, #64dd17 100%)',
                              fontSize: '0.7rem',
                              padding: '5px 10px'
                            }}
                          >
                            <FaCheckCircle className="me-1" /> Verified
                          </Badge>
                        )}
                      </h4>
                      <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                        <FaMedal className="me-2" style={{ color: '#ffa726' }} />
                        {profile.category || 'Student'}
                        <span className="mx-2">•</span>
                        <StrengthIcon className="me-1" style={{ color: profileStrength.color }} />
                        {profileStrength.label} Profile
                      </p>
                    </div>
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="form-label-modern fw-bold">
                          <FaChartLine className="me-2" />
                          Profile Completion
                        </small>
                        <Badge
                          style={{
                            background: completionPercentage === 100 ? '#00c853' : completionPercentage >= 50 ? '#2196f3' : '#ff7043',
                            fontSize: '0.85rem',
                            padding: '5px 12px'
                          }}
                        >
                          {completionPercentage}%
                        </Badge>
                      </div>
                      <ProgressBar
                        now={completionPercentage}
                        style={{
                          height: '30px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '15px',
                          overflow: 'hidden',
                          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        <ProgressBar
                          now={completionPercentage}
                          style={{
                            background: completionPercentage === 100
                              ? 'linear-gradient(135deg, #00c853 0%, #64dd17 100%)'
                              : completionPercentage >= 50
                                ? 'linear-gradient(135deg, #2196f3 0%, #00bcd4 100%)'
                                : 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        />
                      </ProgressBar>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Stats Card */}
          <Col lg={4}>
            <Card className="modern-card profile-strength-card h-100">
              <Card.Body className="p-4 text-white">
                <div className="text-center">
                  <FaAward style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.9 }} />
                  <h3 className="mb-1 fw-bold">{completionPercentage}%</h3>
                  <p className="mb-3" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Profile Strength</p>
                  <div className="d-flex justify-content-around mt-4">
                    <div>
                      <div className="fw-bold" style={{ fontSize: '1.5rem' }}>
                        {profile.cgpa || '0.0'}
                      </div>
                      <small style={{ opacity: 0.8 }}>CGPA</small>
                    </div>
                    <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)' }}></div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: '1.5rem' }}>
                        {[profile.disability, profile.sports, profile.exService].filter(Boolean).length}
                      </div>
                      <small style={{ opacity: 0.8 }}>Special</small>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          {/* Personal Information Card */}
          <Col lg={4} className="mb-4">
            <Card className="modern-card h-100" style={{ transition: 'all 0.3s ease' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div
                    className="stat-icon me-3"
                    style={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      width: '45px',
                      height: '45px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FaUserGraduate style={{ fontSize: '1.3rem', color: '#fff' }} />
                  </div>
                  <h5 className="gradient-text mb-0">Personal Information</h5>
                </div>

                <Form.Group className="mb-4">
                  <Form.Label className="form-label-modern d-flex align-items-center">
                    <FaUser className="me-2" />
                    Full Name
                    <OverlayTrigger
                      placement="right"
                      overlay={<Tooltip>Your full legal name as per documents</Tooltip>}
                    >
                      <FaInfoCircle className="ms-2 text-muted" style={{ fontSize: '0.8rem', cursor: 'pointer' }} />
                    </OverlayTrigger>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    className="form-control-modern"
                    placeholder="Enter your full name"
                    required
                    style={{
                      transition: 'all 0.3s ease',
                      borderRadius: '10px',
                      padding: '12px 15px'
                    }}
                  />
                  {profile.name && (
                    <div className="mt-2">
                      <small className="text-success">
                        <FaCheckCircle className="me-1" /> Name verified
                      </small>
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="form-label-modern d-flex align-items-center">
                    <FaMedal className="me-2" />
                    Category
                    <OverlayTrigger
                      placement="right"
                      overlay={<Tooltip>Your reservation category</Tooltip>}
                    >
                      <FaInfoCircle className="ms-2 text-muted" style={{ fontSize: '0.8rem', cursor: 'pointer' }} />
                    </OverlayTrigger>
                  </Form.Label>
                  <Form.Select
                    name="category"
                    value={profile.category}
                    onChange={handleChange}
                    className="form-control-modern"
                    required
                    style={{
                      transition: 'all 0.3s ease',
                      borderRadius: '10px',
                      padding: '12px 15px'
                    }}
                  >
                    <option value="">Select Category</option>
                    <option value="General">General</option>
                    <option value="OBC">OBC (Other Backward Class)</option>
                    <option value="SC">SC (Scheduled Caste)</option>
                    <option value="ST">ST (Scheduled Tribe)</option>
                    <option value="EWS">EWS (Economically Weaker Section)</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group>
                  <Form.Label className="form-label-modern d-flex align-items-center">
                    <FaMoneyBillWave className="me-2" />
                    Annual Family Income ($)
                    <OverlayTrigger
                      placement="right"
                      overlay={<Tooltip>Total family income for scholarship eligibility</Tooltip>}
                    >
                      <FaInfoCircle className="ms-2 text-muted" style={{ fontSize: '0.8rem', cursor: 'pointer' }} />
                    </OverlayTrigger>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="annualIncome"
                    value={profile.annualIncome}
                    onChange={handleChange}
                    className="form-control-modern"
                    placeholder="Enter annual family income"
                    required
                    style={{
                      transition: 'all 0.3s ease',
                      borderRadius: '10px',
                      padding: '12px 15px'
                    }}
                  />
                  <Form.Text className="text-muted" style={{ fontSize: '0.85rem' }}>
                    <FaInfoCircle className="me-1" />
                    Required for income-based scholarships
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mt-4">
                  <Form.Label className="form-label-modern">Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phoneNumber"
                    value={profile.phoneNumber}
                    onChange={handleChange}
                    className="form-control-modern"
                    placeholder="Enter mobile number"
                  />
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label className="form-label-modern">Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={profile.dateOfBirth || ''}
                    onChange={handleChange}
                    className="form-control-modern"
                  />
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label className="form-label-modern">Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={profile.gender || ''}
                    onChange={handleChange}
                    className="form-control-modern"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label className="form-label-modern">Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={profile.address || ''}
                    onChange={handleChange}
                    className="form-control-modern"
                    placeholder="Enter current address"
                  />
                </Form.Group>

                <Row className="mt-1 g-2">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-modern">State</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={profile.state || ''}
                        onChange={handleChange}
                        className="form-control-modern"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-modern">District</Form.Label>
                      <Form.Control
                        type="text"
                        name="district"
                        value={profile.district || ''}
                        onChange={handleChange}
                        className="form-control-modern"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mt-3">
                  <Form.Label className="form-label-modern">Pincode</Form.Label>
                  <Form.Control
                    type="text"
                    name="pincode"
                    value={profile.pincode || ''}
                    onChange={handleChange}
                    className="form-control-modern"
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          {/* Academic Performance Card */}
          <Col lg={4} className="mb-4">
            <Card className="modern-card h-100" style={{ transition: 'all 0.3s ease' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div
                    className="stat-icon me-3"
                    style={{
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      width: '45px',
                      height: '45px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FaGraduationCap style={{ fontSize: '1.3rem', color: '#fff' }} />
                  </div>
                  <h5 className="gradient-text mb-0">Academic Performance</h5>
                </div>

                <Form.Group className="mb-4">
                  <Form.Label className="form-label-modern d-flex align-items-center justify-content-between">
                    <span>
                      <FaSchool className="me-2" />
                      10th Grade Marks (%)
                    </span>
                    {profile.tenthMarks && (
                      <Badge
                        style={{
                          background: getGradeColor(profile.tenthMarks),
                          fontSize: '0.75rem'
                        }}
                      >
                        {profile.tenthMarks >= 90 ? 'Excellent' : profile.tenthMarks >= 75 ? 'Good' : profile.tenthMarks >= 60 ? 'Average' : 'Below Avg'}
                      </Badge>
                    )}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    max="100"
                    name="tenthMarks"
                    value={profile.tenthMarks}
                    onChange={handleChange}
                    className="form-control-modern"
                    placeholder="Enter 10th grade percentage"
                    required
                    style={{
                      transition: 'all 0.3s ease',
                      borderRadius: '10px',
                      padding: '12px 15px'
                    }}
                  />
                  {profile.tenthMarks && (
                    <div className="mt-2">
                      <ProgressBar
                        now={profile.tenthMarks}
                        max={100}
                        style={{
                          height: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px'
                        }}
                      >
                        <ProgressBar now={profile.tenthMarks} style={{ background: getGradeColor(profile.tenthMarks) }} />
                      </ProgressBar>
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="form-label-dark d-flex align-items-center justify-content-between">
                    <span>
                      <FaBook className="me-2" />
                      12th Grade Marks (%)
                    </span>
                    {profile.twelfthMarks && (
                      <Badge
                        style={{
                          background: getGradeColor(profile.twelfthMarks),
                          fontSize: '0.75rem'
                        }}
                      >
                        {profile.twelfthMarks >= 90 ? 'Excellent' : profile.twelfthMarks >= 75 ? 'Good' : profile.twelfthMarks >= 60 ? 'Average' : 'Below Avg'}
                      </Badge>
                    )}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    max="100"
                    name="twelfthMarks"
                    value={profile.twelfthMarks}
                    onChange={handleChange}
                    className="form-control-modern"
                    placeholder="Enter 12th grade percentage"
                    required
                    style={{
                      transition: 'all 0.3s ease',
                      borderRadius: '10px',
                      padding: '12px 15px'
                    }}
                  />
                  {profile.twelfthMarks && (
                    <div className="mt-2">
                      <ProgressBar
                        now={profile.twelfthMarks}
                        max={100}
                        style={{
                          height: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px'
                        }}
                      >
                        <ProgressBar now={profile.twelfthMarks} style={{ background: getGradeColor(profile.twelfthMarks) }} />
                      </ProgressBar>
                    </div>
                  )}
                </Form.Group>

                <Form.Group>
                  <Form.Label className="form-label-modern d-flex align-items-center justify-content-between">
                    <span>
                      <FaChartLine className="me-2" />
                      Current CGPA (0 - 10)
                    </span>
                    {profile.cgpa && (
                      <Badge
                        style={{
                          background: cgpaInfo.color,
                          fontSize: '0.75rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {cgpaInfo.label}
                      </Badge>
                    )}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    max="10"
                    name="cgpa"
                    value={profile.cgpa}
                    onChange={handleChange}
                    className="form-control-modern"
                    placeholder="Enter current CGPA"
                    required
                    style={{
                      transition: 'all 0.3s ease',
                      borderRadius: '10px',
                      padding: '12px 15px'
                    }}
                  />
                  {profile.cgpa && (
                    <div className="mt-3 p-3 rounded" style={{ background: 'var(--bg-hover)' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="form-label-modern">Performance Rating</small>
                        <small className="fw-bold" style={{ color: cgpaInfo.label === 'Outstanding' ? '#00c853' : cgpaInfo.label === 'Excellent' ? '#2196f3' : '#ffa726' }}>
                          {profile.cgpa}/10
                        </small>
                      </div>
                      <ProgressBar
                        now={cgpaInfo.percentage}
                        style={{
                          height: '12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px'
                        }}
                      >
                        <ProgressBar now={cgpaInfo.percentage} style={{ background: cgpaInfo.color }} />
                      </ProgressBar>
                    </div>
                  )}
                </Form.Group>

                <Row className="mt-3 g-2">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="form-label-modern">Institution Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="institutionName"
                        value={profile.institutionName || ''}
                        onChange={handleChange}
                        className="form-control-modern"
                        placeholder="College/University name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="form-label-modern">Department</Form.Label>
                      <Form.Control
                        type="text"
                        name="department"
                        value={profile.department || ''}
                        onChange={handleChange}
                        className="form-control-modern"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="form-label-modern">Course</Form.Label>
                      <Form.Control
                        type="text"
                        name="course"
                        value={profile.course || ''}
                        onChange={handleChange}
                        className="form-control-modern"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label className="form-label-modern">Year</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="8"
                        name="yearOfStudy"
                        value={profile.yearOfStudy || ''}
                        onChange={handleChange}
                        className="form-control-modern"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          {/* Special Categories Card */}
          <Col lg={4} className="mb-4">
            <Card className="modern-card h-100" style={{ transition: 'all 0.3s ease' }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div
                    className="stat-icon me-3"
                    style={{
                      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      width: '45px',
                      height: '45px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <FaTrophy style={{ fontSize: '1.3rem', color: '#fff' }} />
                  </div>
                  <h5 className="gradient-text mb-0">Special Categories</h5>
                </div>

                <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                  Select all that apply to unlock additional scholarship opportunities
                </p>

                <div
                  className={`profile-option-card mb-4 p-4 ${profile.disability ? 'active' : ''}`}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div
                        className="me-3"
                        style={{
                          background: 'linear-gradient(135deg, #2196f3 0%, #00bcd4 100%)',
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FaWheelchair style={{ fontSize: '1.2rem', color: '#fff' }} />
                      </div>
                      <div>
                        <div className="form-label-modern mb-0 fw-bold">Person with Disability</div>
                        <small className="text-muted">PWD Scholarship Eligible</small>
                      </div>
                    </div>
                    <Form.Check
                      type="switch"
                      id="disability"
                      name="disability"
                      checked={profile.disability}
                      onChange={handleChange}
                      className="custom-switch-dark"
                      style={{ fontSize: '1.5rem' }}
                    />
                  </div>
                </div>

                <div
                  className={`profile-option-card mb-4 p-4 ${profile.sports ? 'active' : ''}`}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div
                        className="me-3"
                        style={{
                          background: 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FaTrophy style={{ fontSize: '1.2rem', color: '#fff' }} />
                      </div>
                      <div>
                        <div className="form-label-modern mb-0 fw-bold">Sports Quota</div>
                        <small className="text-muted">Athletic Achievement</small>
                      </div>
                    </div>
                    <Form.Check
                      type="switch"
                      id="sports"
                      name="sports"
                      checked={profile.sports}
                      onChange={handleChange}
                      className="custom-switch-dark"
                      style={{ fontSize: '1.5rem' }}
                    />
                  </div>
                </div>

                <div
                  className={`profile-option-card mb-4 p-4 ${profile.exService ? 'active' : ''}`}
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <div
                        className="me-3"
                        style={{
                          background: 'linear-gradient(135deg, #00c853 0%, #64dd17 100%)',
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FaFlag style={{ fontSize: '1.2rem', color: '#fff' }} />
                      </div>
                      <div>
                        <div className="form-label-modern mb-0 fw-bold">Ex-Servicemen</div>
                        <small className="text-muted">Defense Family Member</small>
                      </div>
                    </div>
                    <Form.Check
                      type="switch"
                      id="exService"
                      name="exService"
                      checked={profile.exService}
                      onChange={handleChange}
                      className="custom-switch-dark"
                      style={{ fontSize: '1.5rem' }}
                    />
                  </div>
                </div>

                {(profile.disability || profile.sports || profile.exService) && (
                  <div className="profile-success-box mt-4">
                    <div className="success-text">
                      <strong>Great!</strong>
                      <span>You qualify for additional scholarship programs</span>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Save Button Section */}
        <Card className="modern-card">
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col md={8}>
                <div className="d-flex align-items-center">
                  <FaInfoCircle className="me-3 text-primary" style={{ fontSize: '2rem' }} />
                  <div>
                    <h6 className="mb-1 fw-bold gradient-text">Ready to Save Your Profile?</h6>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                      Make sure all information is accurate. This data will be used for scholarship matching and applications.
                    </p>
                  </div>
                </div>
              </Col>
              <Col md={4} className="text-end mt-3 mt-md-0">
                <Button
                  type="submit"
                  disabled={saving}
                  className="btn-primary-modern btn-save-profile px-5 py-3 fw-bold"
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="me-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Form>
    </div>
  );
};

export default Profile;