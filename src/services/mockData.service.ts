// Mock data service for production deployment when backend is not available
// LOGIN CREDENTIALS FOR VERCEL/RENDER DEPLOYMENT:
// Admin: govindamarketing9998@gmail.com / pankil123
// Admin: admin@gmail.com / admin123  
// Admin: newclientmgmt@gmail.com / harish123
// Employee: govindamanager9998@gmail.com / venkat123
// Employee: dinesh@gmail.com / dinesh123

export class MockDataService {
  // Mock enquiries data - EXACT LOCALHOST DATA
  static getEnquiries() {
    return [
      {
        id: 1,
        name: 'BALAMURUGAN',
        businessName: 'Balamurugan Enterprises',
        mobile: '9876543215',
        email: 'balamurugan@enterprises.com',
        businessType: 'Manufacturing',
        loanAmount: 500000,
        district: 'Chennai',
        constitution: 'Proprietorship',
        gstStatus: 'Registered',
        capAmount: 50000,
        bankAccount: 'Yes',
        statementDuration: '12 months',
        createdAt: new Date('2024-10-16T10:37:11.406Z').toISOString(),
        updatedAt: new Date('2024-10-16T10:37:11.406Z').toISOString()
      },
      {
        id: 2,
        name: 'VIGNESH S',
        businessName: 'Vignesh Trading',
        mobile: '9876543220',
        email: 'vignesh@trading.com',
        businessType: 'Trading',
        loanAmount: 300000,
        district: 'Coimbatore',
        constitution: 'Partnership',
        gstStatus: 'Registered',
        capAmount: 30000,
        bankAccount: 'Yes',
        statementDuration: '6 months',
        createdAt: new Date('2024-10-15T09:20:30.123Z').toISOString(),
        updatedAt: new Date('2024-10-15T09:20:30.123Z').toISOString()
      },
      {
        id: 3,
        name: 'Poorani',
        businessName: 'Poorani Textiles',
        mobile: '9876543221',
        email: 'poorani@textiles.com',
        businessType: 'Textiles',
        loanAmount: 750000,
        district: 'Madurai',
        constitution: 'Private Limited',
        gstStatus: 'Registered',
        capAmount: 75000,
        bankAccount: 'Yes',
        statementDuration: '12 months',
        createdAt: new Date('2024-10-14T14:15:45.789Z').toISOString(),
        updatedAt: new Date('2024-10-14T14:15:45.789Z').toISOString()
      },
      {
        id: 4,
        name: 'Manigandan M',
        businessName: 'Manigandan Industries',
        mobile: '9876543222',
        email: 'manigandan@industries.com',
        businessType: 'Manufacturing',
        loanAmount: 1000000,
        district: 'Salem',
        constitution: 'Private Limited',
        gstStatus: 'Registered',
        capAmount: 100000,
        bankAccount: 'Yes',
        statementDuration: '18 months',
        createdAt: new Date('2024-10-13T11:30:15.456Z').toISOString(),
        updatedAt: new Date('2024-10-13T11:30:15.456Z').toISOString()
      },
      {
        id: 5,
        name: 'Praba',
        businessName: 'Praba Enterprises',
        mobile: '9876543223',
        email: 'praba@enterprises.com',
        businessType: 'Services',
        loanAmount: 400000,
        district: 'Trichy',
        constitution: 'Proprietorship',
        gstStatus: 'Registered',
        capAmount: 40000,
        bankAccount: 'Yes',
        statementDuration: '9 months',
        createdAt: new Date('2024-10-12T16:45:30.789Z').toISOString(),
        updatedAt: new Date('2024-10-12T16:45:30.789Z').toISOString()
      },
      {
        id: 6,
        name: 'Renu',
        businessName: 'Renu Trading Co',
        mobile: '9876543210',
        email: 'renu@trading.com',
        businessType: 'Trading',
        loanAmount: 250000,
        district: 'Erode',
        constitution: 'Partnership',
        gstStatus: 'Registered',
        capAmount: 25000,
        bankAccount: 'Yes',
        statementDuration: '6 months',
        createdAt: new Date('2024-10-11T08:15:45.123Z').toISOString(),
        updatedAt: new Date('2024-10-11T08:15:45.123Z').toISOString()
      }
    ];
  }

  // Mock documents data - EXACT LOCALHOST DATA
  static getDocuments() {
    return [
      // BALAMURUGAN's verified documents
      {
        id: 1,
        enquiryId: 1,
        type: 'GST',
        fileName: 'gst-certificate-balamurugan.pdf',
        filePath: '/uploads/documents/1729073400000-1-GST.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-16T11:00:00.000Z').toISOString(),
        createdAt: new Date('2024-10-16T10:45:00.000Z').toISOString(),
        enquiry: {
          id: 1,
          name: 'BALAMURUGAN',
          mobile: '9876543215',
          businessType: 'Manufacturing'
        }
      },
      {
        id: 2,
        enquiryId: 1,
        type: 'UDYAM',
        fileName: 'udyam-certificate-balamurugan.pdf',
        filePath: '/uploads/documents/1729073460000-1-UDYAM.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-16T11:05:00.000Z').toISOString(),
        createdAt: new Date('2024-10-16T10:50:00.000Z').toISOString(),
        enquiry: {
          id: 1,
          name: 'BALAMURUGAN',
          mobile: '9876543215',
          businessType: 'Manufacturing'
        }
      },
      {
        id: 3,
        enquiryId: 1,
        type: 'BANK_STATEMENT',
        fileName: 'bank-statement-balamurugan.pdf',
        filePath: '/uploads/documents/1729073520000-1-BANK_STATEMENT.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-16T11:10:00.000Z').toISOString(),
        createdAt: new Date('2024-10-16T10:55:00.000Z').toISOString(),
        enquiry: {
          id: 1,
          name: 'BALAMURUGAN',
          mobile: '9876543215',
          businessType: 'Manufacturing'
        }
      },
      {
        id: 4,
        enquiryId: 1,
        type: 'OWNER_PAN',
        fileName: 'owner-pan-balamurugan.pdf',
        filePath: '/uploads/documents/1729073580000-1-OWNER_PAN.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-16T11:15:00.000Z').toISOString(),
        createdAt: new Date('2024-10-16T11:00:00.000Z').toISOString(),
        enquiry: {
          id: 1,
          name: 'BALAMURUGAN',
          mobile: '9876543215',
          businessType: 'Manufacturing'
        }
      },
      {
        id: 5,
        enquiryId: 1,
        type: 'AADHAR',
        fileName: 'aadhar-balamurugan.pdf',
        filePath: '/uploads/documents/1729073640000-1-AADHAR.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-16T11:20:00.000Z').toISOString(),
        createdAt: new Date('2024-10-16T11:05:00.000Z').toISOString(),
        enquiry: {
          id: 1,
          name: 'BALAMURUGAN',
          mobile: '9876543215',
          businessType: 'Manufacturing'
        }
      },
      // VIGNESH S documents
      {
        id: 6,
        enquiryId: 2,
        type: 'GST',
        fileName: 'gst-certificate-vignesh.pdf',
        filePath: '/uploads/documents/1729073700000-2-GST.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-15T14:30:00.000Z').toISOString(),
        createdAt: new Date('2024-10-15T14:15:00.000Z').toISOString(),
        enquiry: {
          id: 2,
          name: 'VIGNESH S',
          mobile: '9876543220',
          businessType: 'Trading'
        }
      },
      {
        id: 7,
        enquiryId: 2,
        type: 'UDYAM',
        fileName: 'udyam-certificate-vignesh.pdf',
        filePath: '/uploads/documents/1729073760000-2-UDYAM.pdf',
        verified: false,
        createdAt: new Date('2024-10-15T14:20:00.000Z').toISOString(),
        enquiry: {
          id: 2,
          name: 'VIGNESH S',
          mobile: '9876543220',
          businessType: 'Trading'
        }
      },
      // Poorani documents
      {
        id: 8,
        enquiryId: 3,
        type: 'GST',
        fileName: 'gst-certificate-poorani.pdf',
        filePath: '/uploads/documents/1729073820000-3-GST.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-14T16:45:00.000Z').toISOString(),
        createdAt: new Date('2024-10-14T16:30:00.000Z').toISOString(),
        enquiry: {
          id: 3,
          name: 'Poorani',
          mobile: '9876543221',
          businessType: 'Textiles'
        }
      },
      {
        id: 9,
        enquiryId: 3,
        type: 'BANK_STATEMENT',
        fileName: 'bank-statement-poorani.pdf',
        filePath: '/uploads/documents/1729073880000-3-BANK_STATEMENT.pdf',
        verified: false,
        createdAt: new Date('2024-10-14T16:35:00.000Z').toISOString(),
        enquiry: {
          id: 3,
          name: 'Poorani',
          mobile: '9876543221',
          businessType: 'Textiles'
        }
      }
    ];
  }

  // Mock shortlist data - EXACT LOCALHOST DATA
  static getShortlist() {
    return [
      {
        id: 1,
        enquiryId: 1,
        name: 'BALAMURUGAN',
        mobile: '9876543215',
        businessName: 'Balamurugan Enterprises',
        businessNature: 'Manufacturing',
        businessType: 'Manufacturing',
        loanAmount: 500000,
        district: 'Chennai',
        constitution: 'Proprietorship',
        gstStatus: 'Registered',
        capAmount: 50000,
        bankAccount: 'Yes',
        statementDuration: '12 months',
        staff: 'Pankil',
        interestStatus: 'Interested',
        priority: 'High',
        notes: 'All documents verified, ready for payment gateway',
        createdAt: new Date('2024-10-16T12:00:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-16T12:00:00.000Z').toISOString(),
        enquiry: {
          id: 1,
          name: 'BALAMURUGAN',
          mobile: '9876543215',
          businessType: 'Manufacturing',
          businessName: 'Balamurugan Enterprises'
        }
      },
      {
        id: 2,
        enquiryId: 2,
        name: 'VIGNESH S',
        mobile: '9876543220',
        businessName: 'Vignesh Trading',
        businessNature: 'Trading',
        businessType: 'Trading',
        loanAmount: 300000,
        district: 'Coimbatore',
        constitution: 'Partnership',
        gstStatus: 'Registered',
        capAmount: 30000,
        bankAccount: 'Yes',
        statementDuration: '6 months',
        staff: 'Venkat',
        interestStatus: 'Interested',
        priority: 'Medium',
        notes: 'Pending UDYAM verification',
        createdAt: new Date('2024-10-15T13:30:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-15T13:30:00.000Z').toISOString(),
        enquiry: {
          id: 2,
          name: 'VIGNESH S',
          mobile: '9876543220',
          businessType: 'Trading',
          businessName: 'Vignesh Trading'
        }
      },
      {
        id: 3,
        enquiryId: 3,
        name: 'Poorani',
        mobile: '9876543221',
        businessName: 'Poorani Textiles',
        businessNature: 'Textiles',
        businessType: 'Textiles',
        loanAmount: 750000,
        district: 'Madurai',
        constitution: 'Private Limited',
        gstStatus: 'Registered',
        capAmount: 75000,
        bankAccount: 'Yes',
        statementDuration: '12 months',
        staff: 'Dinesh',
        interestStatus: 'Very Interested',
        priority: 'High',
        notes: 'Large loan amount, good business profile',
        createdAt: new Date('2024-10-14T17:15:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-14T17:15:00.000Z').toISOString(),
        enquiry: {
          id: 3,
          name: 'Poorani',
          mobile: '9876543221',
          businessType: 'Textiles',
          businessName: 'Poorani Textiles'
        }
      }
    ];
  }

  // Mock payment gateway data
  static getPaymentGateway() {
    return [
      {
        id: 1,
        shortlistId: 1,
        loanAmount: 500000,
        tenure: 24,
        interestRate: 12.5,
        status: 'PENDING',
        createdAt: new Date('2024-10-16T13:00:00.000Z').toISOString(),
        shortlist: {
          id: 1,
          name: 'BALAMURUGAN',
          mobile: '9876543215',
          businessName: 'Balamurugan Enterprises',
          businessType: 'Manufacturing',
          loanAmount: 500000,
          enquiry: {
            id: 9570,
            name: 'BALAMURUGAN',
            mobile: '9876543215',
            businessType: 'Manufacturing',
            businessName: 'Balamurugan Enterprises'
          }
        },
        submittedBy: {
          id: 1,
          name: 'Pankil',
          email: 'govindamarketing9998@gmail.com'
        }
      }
    ];
  }

  // Mock staff data
  static getStaff() {
    return [
      {
        id: 1,
        name: 'Pankil',
        email: 'govindamarketing9998@gmail.com',
        password: 'pankil123', // Actual localhost password
        role: 'ADMIN',
        department: 'Management',
        verified: true,
        hasAccess: true,
        status: 'ACTIVE',
        createdAt: new Date('2024-10-01T09:00:00.000Z').toISOString()
      },
      {
        id: 2,
        name: 'Venkat',
        email: 'govindamanager9998@gmail.com',
        password: 'venkat123',
        role: 'EMPLOYEE',
        department: 'Operations',
        verified: true,
        hasAccess: true,
        status: 'ACTIVE',
        createdAt: new Date('2024-10-02T10:00:00.000Z').toISOString()
      },
      {
        id: 3,
        name: 'Dinesh',
        email: 'dinesh@gmail.com',
        password: 'dinesh123',
        role: 'EMPLOYEE',
        department: 'Processing',
        verified: true,
        hasAccess: true,
        status: 'ACTIVE',
        createdAt: new Date('2024-10-03T11:00:00.000Z').toISOString()
      },
      {
        id: 4,
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'admin123',
        role: 'ADMIN',
        department: 'Administration',
        verified: true,
        hasAccess: true,
        status: 'ACTIVE',
        createdAt: new Date('2024-10-04T12:00:00.000Z').toISOString()
      },
      {
        id: 5,
        name: 'Harish',
        email: 'newclientmgmt@gmail.com',
        password: 'harish123',
        role: 'ADMIN',
        department: 'Client Management',
        verified: true,
        hasAccess: true,
        status: 'ACTIVE',
        createdAt: new Date('2024-10-05T13:00:00.000Z').toISOString()
      }
    ];
  }

  // Mock authentication
  static authenticateStaff(email: string, password: string) {
    const staff = this.getStaff().find(s => s.email === email);
    
    if (!staff || !staff.hasAccess || staff.status !== 'ACTIVE') {
      return null;
    }
    
    // Simple password check for demo
    if (staff.password !== password) {
      return null;
    }
    
    // Generate mock JWT token
    const authToken = `mock-jwt-token-${staff.id}-${Date.now()}`;
    
    // Return staff without password
    const { password: _, ...staffWithoutPassword } = staff;
    
    return {
      access_token: authToken,
      user: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    };
  }

  // Mock transactions data
  static getTransactions() {
    return [
      {
        id: 1,
        name: 'BALAMURUGAN',
        transactionId: 'TXN001',
        amount: 500000,
        status: 'COMPLETED',
        date: new Date('2024-10-16T14:00:00.000Z').toISOString(),
        createdAt: new Date('2024-10-16T14:00:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-16T14:00:00.000Z').toISOString()
      }
    ];
  }

  // Mock notifications data
  static getNotifications() {
    return [
      {
        id: 'notif_1',
        type: 'NEW_ENQUIRY',
        title: 'New Enquiry Received',
        message: 'New enquiry from BALAMURUGAN (Manufacturing) for ₹5,00,000 business loan received at 4:28:45 pm',
        priority: 'HIGH',
        read: false,
        createdAt: new Date('2024-10-16T10:37:11.406Z').toISOString(),
        data: {
          enquiryId: 9570,
          clientName: 'BALAMURUGAN',
          loanAmount: 500000,
          businessType: 'Manufacturing'
        }
      },
      {
        id: 'notif_2',
        type: 'DOCUMENT_UPLOADED',
        title: 'Document Uploaded',
        message: 'GST document uploaded by BALAMURUGAN at 4:25:30 pm - awaiting verification',
        priority: 'MEDIUM',
        read: false,
        createdAt: new Date('2024-10-16T10:45:00.000Z').toISOString(),
        data: {
          documentId: 1,
          clientName: 'BALAMURUGAN',
          documentType: 'GST'
        }
      }
    ];
  }

  // Dashboard stats
  static getDashboardStats() {
    const enquiries = this.getEnquiries();
    const documents = this.getDocuments();
    const shortlist = this.getShortlist();
    const transactions = this.getTransactions();
    const staff = this.getStaff();

    return {
      totalEnquiries: enquiries.length,
      totalDocuments: documents.length,
      verifiedDocuments: documents.filter(d => d.verified).length,
      totalShortlisted: shortlist.length,
      totalTransactions: transactions.length,
      completedTransactions: transactions.filter(t => t.status === 'COMPLETED').length,
      pendingTransactions: transactions.filter(t => t.status === 'PENDING').length,
      totalStaff: staff.length,
      activeStaff: staff.filter(s => s.hasAccess).length
    };
  }
}

export default MockDataService;
