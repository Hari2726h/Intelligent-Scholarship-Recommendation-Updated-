import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert } from 'react-bootstrap';
import { FaUpload, FaTrash, FaFile, FaFilePdf, FaFileImage, FaFileWord } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { uploadDocument, getMyDocuments, deleteDocument } from '../services/documentService';
import Loader from '../components/Loader';

const DocumentManagement = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const documentTypes = [
        'TRANSCRIPT',
        'ID_PROOF',
        'INCOME_CERTIFICATE',
        'CASTE_CERTIFICATE',
        'RECOMMENDATION_LETTER',
        'RESUME',
        'OTHER'
    ];

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await getMyDocuments();
            setDocuments(response.data || []);
        } catch (error) {
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setSelectedFile(acceptedFiles[0]);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
    });

    const handleUpload = async () => {
        if (!selectedFile || !selectedDocType) {
            toast.error('Please select a file and document type');
            return;
        }

        setUploading(true);
        try {
            await uploadDocument(selectedFile, selectedDocType);
            toast.success('Document uploaded successfully!');
            setShowUploadModal(false);
            setSelectedFile(null);
            setSelectedDocType('');
            fetchDocuments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this document?')) {
            try {
                await deleteDocument(id);
                toast.success('Document deleted successfully');
                fetchDocuments();
            } catch (error) {
                toast.error('Failed to delete document');
            }
        }
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop().toLowerCase();
        if (ext === 'pdf') return <FaFilePdf className="text-danger" size={24} />;
        if (['jpg', 'jpeg', 'png'].includes(ext)) return <FaFileImage className="text-info" size={24} />;
        if (['doc', 'docx'].includes(ext)) return <FaFileWord className="text-primary" size={24} />;
        return <FaFile className="text-secondary" size={24} />;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDocType = (type) => {
        return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    if (loading) return <Loader />;

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="fw-bold mb-1">Document Management</h2>
                            <p className="text-muted">Upload and manage your scholarship documents</p>
                        </div>
                        <Button
                            className="btn-primary-modern"
                            onClick={() => setShowUploadModal(true)}
                        >
                            <FaUpload className="me-2" />
                            Upload Document
                        </Button>
                    </div>
                </Col>
            </Row>

            {documents.length === 0 ? (
                <Card className="modern-card text-center py-5 shadow-sm">
                    <Card.Body>
                        <FaFile size={60} className="text-muted mb-3" />
                        <h4>No Documents Uploaded</h4>
                        <p className="text-muted">Upload your documents to keep them organized</p>
                        <Button
                            className="btn-primary-modern"
                            onClick={() => setShowUploadModal(true)}
                        >
                            Upload Your First Document
                        </Button>
                    </Card.Body>
                </Card>
            ) : (
                <Card className="modern-card">
                    <Card.Body>
                        <Table responsive hover className="table-modern align-middle">
                            <thead>
                                <tr>
                                    <th>File</th>
                                    <th>Document Type</th>
                                    <th>Size</th>
                                    <th>Uploaded On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map((doc) => (
                                    <tr key={doc.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                {getFileIcon(doc.fileName)}
                                                <span className="fw-semibold">{doc.fileName}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge className="badge-primary-modern">
                                                {formatDocType(doc.documentType)}
                                            </Badge>
                                        </td>
                                        <td>{formatFileSize(doc.fileSize)}</td>
                                        <td>{new Date(doc.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(doc.id)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            )}

            {/* Upload Modal */}
            <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Upload Document</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Document Type</Form.Label>
                            <Form.Select
                                value={selectedDocType}
                                onChange={(e) => setSelectedDocType(e.target.value)}
                            >
                                <option value="">Select document type...</option>
                                {documentTypes.map(type => (
                                    <option key={type} value={type}>
                                        {formatDocType(type)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>File</Form.Label>
                            <div
                                {...getRootProps()}
                                className={`dropzone-modern p-5 text-center`}
                                style={{ cursor: 'pointer', borderStyle: 'dashed' }}
                            >
                                <input {...getInputProps()} />
                                {selectedFile ? (
                                    <div>
                                        <FaFile size={48} className="text-success mb-3" />
                                        <p className="mb-0"><strong>{selectedFile.name}</strong></p>
                                        <p className="text-muted">{formatFileSize(selectedFile.size)}</p>
                                    </div>
                                ) : (
                                    <div>
                                        <FaUpload size={48} className="text-muted mb-3" />
                                        <p>
                                            {isDragActive
                                                ? 'Drop the file here...'
                                                : 'Drag & drop a file here, or click to select'}
                                        </p>
                                        <p className="text-muted small">
                                            Supported formats: PDF, JPG, PNG, DOC, DOCX
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Form.Group>

                        {selectedFile && selectedDocType && (
                            <Alert variant="info">
                                <strong>Ready to upload:</strong> {selectedFile.name} as {formatDocType(selectedDocType)}
                            </Alert>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="btn-primary-modern"
                        onClick={handleUpload}
                        disabled={!selectedFile || !selectedDocType || uploading}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default DocumentManagement;
