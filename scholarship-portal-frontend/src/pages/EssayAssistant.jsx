import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Badge } from 'react-bootstrap';
import { FaPen, FaMagic, FaEraser, FaCopy, FaCheckCircle, FaLightbulb } from 'react-icons/fa';
import { generateEssayDraft, improveEssay } from '../services/geminiService';
import { toast } from 'react-toastify';

const EssayAssistant = () => {

  const [mode, setMode] = useState('generate');

  const [scholarshipName, setScholarshipName] = useState('');
  const [topic, setTopic] = useState('');
  const [keyPoints, setKeyPoints] = useState('');

  const [existingEssay, setExistingEssay] = useState('');
  const [improvementFocus, setImprovementFocus] = useState('');

  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!scholarshipName.trim() || !topic.trim()) {
      toast.error('Please fill in the scholarship name and topic/theme.');
      return;
    }

    if (!keyPoints.trim()) {
      toast.error('Please add some key points about yourself.');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const essay = await generateEssayDraft(topic, keyPoints, scholarshipName);
      setResult(essay);
      toast.success('Essay generated successfully!');
    } catch {
      toast.error('Failed to generate essay. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {

    if (!existingEssay.trim() || existingEssay.trim().length < 50) {
      toast.error('Please paste your existing essay (minimum 50 characters).');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const improved = await improveEssay(existingEssay, improvementFocus);
      setResult(improved);
      toast.success('Essay improved!');
    } catch {
      toast.error('Failed to improve essay. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {

    if (!result) return;

    let textToCopy = result;

    const essayMatch = result.match(/IMPROVED ESSAY:\s*([\s\S]*?)(?=\n\nKEY CHANGES:|$)/);

    if (essayMatch) {
      textToCopy = essayMatch[1].trim();
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });

  };

  const handleClear = () => {

    setResult('');

    if (mode === 'generate') {
      setScholarshipName('');
      setTopic('');
      setKeyPoints('');
    } else {
      setExistingEssay('');
      setImprovementFocus('');
    }

  };

  const sampleTopics = [
    'My academic journey and future goals',
    'How this scholarship will help achieve my dreams',
    'Challenges I overcame to reach this point',
    'My commitment to giving back to society',
  ];

  const renderFormattedResult = (text) => {

    if (!text) return null;

    return text.split('\n').map((line, idx) => {

      if (
        line.startsWith('IMPROVED ESSAY:') ||
        line.startsWith('KEY CHANGES:')
      ) {
        return (
          <div key={idx} className="essay-section-title">
            {line}
          </div>
        );
      }

      if (line.trim() === '') return <br key={idx} />;

      return (
        <p key={idx}>
          {line}
        </p>
      );

    });

  };

  return (

    <Container fluid className="py-4">

      {/* HEADER */}

      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold mb-2">
            <FaPen className="me-2" />
            AI Essay Assistant
          </h2>

          <p className="text-muted">
            Generate a compelling scholarship personal statement or improve your existing essay using AI.
          </p>
        </Col>
      </Row>

      {/* MODE SWITCH */}

      <Row className="mb-4">
        <Col>
          <div className="d-flex gap-2">

            <Button
              className={mode === 'generate' ? 'btn-primary-modern' : 'btn-outline-modern'}
              onClick={() => { setMode('generate'); setResult(''); }}
            >
              <FaMagic className="me-2" />
              Generate New Essay
            </Button>

            <Button
              className={mode === 'improve' ? 'btn-primary-modern' : 'btn-outline-modern'}
              onClick={() => { setMode('improve'); setResult(''); }}
            >
              <FaLightbulb className="me-2" />
              Improve My Essay
            </Button>

          </div>
        </Col>
      </Row>

      <Row className="g-4">

        {/* LEFT PANEL */}

        <Col lg={5}>

          <Card className="modern-card h-100">

            <Card.Header className="dark-card-header">
              <h5 className="mb-0 text-white">
                {mode === 'generate'
                  ? '✍️ Generate New Essay'
                  : '🔧 Improve Your Essay'}
              </h5>
            </Card.Header>

            <Card.Body>

              {mode === 'generate' ? (

                <>

                  <Form.Group className="mb-3">
                    <Form.Label>Scholarship Name *</Form.Label>
                    <Form.Control
                      className="form-control-modern"
                      placeholder="e.g., National Merit Scholarship 2026"
                      value={scholarshipName}
                      onChange={(e) => setScholarshipName(e.target.value)}
                    />
                  </Form.Group>


                  <Form.Group className="mb-3">

                    <Form.Label>Essay Topic / Theme *</Form.Label>

                    <Form.Control
                      className="form-control-modern"
                      placeholder="e.g., My academic journey and future aspirations"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />

                    <div className="mt-2">
                      <small className="text-muted">Sample topics:</small>

                      <div className="d-flex flex-wrap gap-1 mt-1">

                        {sampleTopics.map((t, i) => (
                          <Badge
                            key={i}
                            className="badge-primary-modern"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setTopic(t)}
                          >
                            {t}
                          </Badge>
                        ))}

                      </div>

                    </div>

                  </Form.Group>


                  <Form.Group className="mb-4">

                    <Form.Label>Key Points About You *</Form.Label>

                    <Form.Control
                      className="form-control-modern"
                      as="textarea"
                      rows={5}
                      placeholder="Share your achievements, financial background, goals, and why you deserve this scholarship."
                      value={keyPoints}
                      onChange={(e) => setKeyPoints(e.target.value)}
                    />

                  </Form.Group>


                  <Button
                    className="btn-primary-modern w-100"
                    onClick={handleGenerate}
                    disabled={loading}
                  >

                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Generating Essay...
                      </>
                    ) : (
                      <>
                        <FaMagic className="me-2" />
                        Generate Essay
                      </>
                    )}

                  </Button>

                </>

              ) : (

                <>

                  <Form.Group className="mb-3">

                    <Form.Label>Paste Your Existing Essay *</Form.Label>

                    <Form.Control
                      className="form-control-modern"
                      as="textarea"
                      rows={8}
                      placeholder="Paste your existing scholarship essay here..."
                      value={existingEssay}
                      onChange={(e) => setExistingEssay(e.target.value)}
                    />

                    <small className="text-muted">
                      {existingEssay.length} characters
                    </small>

                  </Form.Group>


                  <Form.Group className="mb-4">

                    <Form.Label>What to Improve?</Form.Label>

                    <Form.Control
                      className="form-control-modern"
                      placeholder="e.g., improve conclusion, grammar, storytelling"
                      value={improvementFocus}
                      onChange={(e) => setImprovementFocus(e.target.value)}
                    />

                  </Form.Group>


                  <Button
                    className="btn-primary-modern w-100"
                    onClick={handleImprove}
                    disabled={loading}
                  >

                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Improving Essay...
                      </>
                    ) : (
                      <>
                        <FaLightbulb className="me-2" />
                        Improve Essay
                      </>
                    )}

                  </Button>

                </>

              )}

            </Card.Body>

          </Card>

        </Col>


        {/* RESULT PANEL */}

        <Col lg={7}>

          <Card className="modern-card h-100">

            <Card.Header className="dark-card-header d-flex justify-content-between align-items-center">

              <h5 className="mb-0 text-white">📄 AI Generated Essay</h5>

              {result && (

                <div className="d-flex gap-2">

                  <Button
                    size="sm"
                    className="btn-outline-modern"
                    onClick={handleCopy}
                  >

                    {copied
                      ? <><FaCheckCircle className="me-1" />Copied!</>
                      : <><FaCopy className="me-1" />Copy</>}

                  </Button>

                  <Button
                    size="sm"
                    className="btn-outline-modern"
                    onClick={handleClear}
                  >
                    <FaEraser className="me-1" />
                    Clear
                  </Button>

                </div>

              )}

            </Card.Header>

            <Card.Body className="essay-result-area">

              {loading && (

                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="text-muted mt-3">
                    AI is crafting your essay...
                  </p>
                </div>

              )}

              {!loading && !result && (

                <div className="text-center py-5 text-muted">

                  <FaPen size={48} style={{ opacity: 0.3 }} />

                  <p className="mt-3">
                    Fill the form and click
                    <strong className="text-primary"> {mode === 'generate' ? 'Generate Essay' : 'Improve Essay'} </strong>
                    to create your AI essay.
                  </p>

                  <div className="essay-tip-box">

                    <strong>💡 Tips for a great essay:</strong>

                    <ul className="mt-2">
                      <li>Be specific about achievements</li>
                      <li>Explain your financial need</li>
                      <li>Highlight community service</li>
                      <li>Describe future goals</li>
                      <li>Always personalize the AI output</li>
                    </ul>

                  </div>

                </div>

              )}

              {!loading && result && (

                <div style={{ fontFamily: 'Georgia, serif' }}>
                  {renderFormattedResult(result)}

                  <div className="essay-warning">

                    ⚠️ <strong>Reminder:</strong> This AI essay is a starting point.
                    Always personalize it before submitting.

                  </div>

                </div>

              )}

            </Card.Body>

          </Card>

        </Col>

      </Row>

    </Container>

  );

};

export default EssayAssistant;