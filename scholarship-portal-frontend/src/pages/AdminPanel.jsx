import { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FaPlusCircle } from "react-icons/fa";
import API from "../services/api";
import { toast } from "react-toastify";

function AdminPanel() {
  const [data, setData] = useState({
    name: "",
    description: "",
    minCgpa: "",
    minTenthMarks: "",
    minTwelfthMarks: "",
    maxIncome: "",
    amount: "",
    deadline: "",
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/scholarships", data);
      toast.success("Scholarship Created Successfully!");
    } catch (err) {
      toast.error("Failed to create scholarship");
    }
  };

  return (
    <Container fluid className="py-4" style={{ maxWidth: "1100px" }}>
      
      <h2 className="gradient-text fw-bold mb-4">
        <FaPlusCircle className="me-2" />
        Create Scholarship
      </h2>

      <div className="modern-card p-4">

        <Form onSubmit={handleSubmit}>

          <Row className="g-4">

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">Scholarship Name</Form.Label>
                <Form.Control
                  className="form-control-modern"
                  name="name"
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  className="form-control-modern"
                  name="amount"
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label className="form-label-modern">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  className="form-control-modern"
                  name="description"
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="form-label-modern">Min CGPA</Form.Label>
                <Form.Control
                  type="number"
                  className="form-control-modern"
                  name="minCgpa"
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="form-label-modern">Min 10th Marks</Form.Label>
                <Form.Control
                  type="number"
                  className="form-control-modern"
                  name="minTenthMarks"
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="form-label-modern">Min 12th Marks</Form.Label>
                <Form.Control
                  type="number"
                  className="form-control-modern"
                  name="minTwelfthMarks"
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">Max Family Income</Form.Label>
                <Form.Control
                  type="number"
                  className="form-control-modern"
                  name="maxIncome"
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label-modern">Deadline</Form.Label>
                <Form.Control
                  type="date"
                  className="form-control-modern"
                  name="deadline"
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

          </Row>

          <div className="mt-4 text-end">
            <Button type="submit" className="btn-primary-modern px-4">
              Create Scholarship
            </Button>
          </div>

        </Form>

      </div>

    </Container>
  );
}

export default AdminPanel;