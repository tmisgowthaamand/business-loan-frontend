// Mock data service for production deployment when backend is not available
// LOGIN CREDENTIALS FOR VERCEL/RENDER DEPLOYMENT:
// Admin: govindamarketing9998@gmail.com / admin123
// Admin: admin@gmail.com / admin123  
// Admin: newclientmgmt@gmail.com / admin123
// Employee: govindamanager9998@gmail.com / employee123
// Employee: dinesh@gmail.com / employee123

export class MockDataService {
  // Mock enquiries data
  static getEnquiries() {
    return [
      {
        id: 9570,
        name: 'BALAMURUGAN',
        mobile: '9876543215',
        businessType: 'Manufacturing',
        businessName: 'Balamurugan Enterprises',
        loanAmount: 500000,
        district: 'Chennai',
        constitution: 'Proprietorship',
        gstStatus: 'Registered',
        createdAt: new Date('2024-10-16T10:37:11.406Z').toISOString(),
        updatedAt: new Date('2024-10-16T10:37:11.406Z').toISOString()
      },
      {
        id: 9571,
        name: 'RAJESH KUMAR',
        mobile: '9876543216',
        businessType: 'Trading',
        businessName: 'Kumar Trading Co',
        loanAmount: 300000,
        district: 'Mumbai',
        constitution: 'Partnership',
        gstStatus: 'Registered',
        createdAt: new Date('2024-10-15T09:20:30.123Z').toISOString(),
        updatedAt: new Date('2024-10-15T09:20:30.123Z').toISOString()
      },
      {
        id: 9572,
        name: 'PRIYA SHARMA',
        mobile: '9876543217',
        businessType: 'Textiles',
        businessName: 'Sharma Textiles',
        loanAmount: 750000,
        district: 'Delhi',
        constitution: 'Private Limited',
        gstStatus: 'Registered',
        createdAt: new Date('2024-10-14T14:15:45.789Z').toISOString(),
        updatedAt: new Date('2024-10-14T14:15:45.789Z').toISOString()
      }
    ];
  }

  // Mock documents data
  static getDocuments() {
    return [
      {
        id: 1,
        enquiryId: 9570,
        type: 'GST',
        fileName: 'gst-certificate-balamurugan.pdf',
        filePath: '/uploads/documents/gst-certificate-balamurugan.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-16T11:00:00.000Z').toISOString(),
        createdAt: new Date('2024-10-16T10:45:00.000Z').toISOString(),
        enquiry: {
          id: 9570,
          name: 'BALAMURUGAN',
          mobile: '9876543215',
          businessType: 'Manufacturing'
        }
      },
      {
        id: 2,
        enquiryId: 9570,
        type: 'UDYAM',
        fileName: 'udyam-certificate-balamurugan.pdf',
        filePath: '/uploads/documents/udyam-certificate-balamurugan.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-16T11:05:00.000Z').toISOString(),
        createdAt: new Date('2024-10-16T10:50:00.000Z').toISOString(),
        enquiry: {
          id: 9570,
          name: 'BALAMURUGAN',
          mobile: '9876543215',
          businessType: 'Manufacturing'
        }
      },
      {
        id: 3,
        enquiryId: 9571,
        type: 'GST',
        fileName: 'gst-certificate-rajesh.pdf',
        filePath: '/uploads/documents/gst-certificate-rajesh.pdf',
        verified: false,
        createdAt: new Date('2024-10-15T12:30:00.000Z').toISOString(),
        enquiry: {
          id: 9571,
          name: 'RAJESH KUMAR',
          mobile: '9876543216',
          businessType: 'Trading'
        }
      }
    ];
  }

  // Mock shortlist data
  static getShortlist() {
    return [
      {
        id: 1,
        enquiryId: 9570,
        name: 'BALAMURUGAN',
        mobile: '9876543215',
        businessName: 'Balamurugan Enterprises',
        businessType: 'Manufacturing',
        loanAmount: 500000,
        staff: 'Pankil',
        interestStatus: 'Interested',
        createdAt: new Date('2024-10-16T12:00:00.000Z').toISOString(),
        enquiry: {
          id: 9570,
          name: 'BALAMURUGAN',
          mobile: '9876543215',
          businessType: 'Manufacturing',
          businessName: 'Balamurugan Enterprises'
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
        password: 'admin123', // For demo purposes
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
        password: 'employee123',
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
        password: 'employee123',
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
        password: 'admin123',
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
