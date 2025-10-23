// Mock data service for production deployment when backend is not available
// LOGIN CREDENTIALS FOR VERCEL/RENDER DEPLOYMENT (UPDATED STAFF MEMBERS):
// Admin: gowthaamankrishna1998@gmail.com / 12345678 (Perivi)
// Employee: gowthaamaneswar1998@gmail.com / 12345678 (Venkat)
// Admin: newacttmis@gmail.com / 12345678 (Harish)
// Employee: dinesh@gmail.com / 12345678 (Dinesh)
// Admin: tmsnunciya59@gmail.com / 12345678 (Nunciya)
// Admin: admin@businessloan.com / 12345678 (Admin User)
// Admin: admin@gmail.com / 12345678 (Admin User)

export class MockDataService {
  // Mock enquiries data - COMPREHENSIVE LOCALHOST DATA
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
        status: 'APPROVED',
        priority: 'High',
        assignedStaff: 'Perivi',
        source: 'ONLINE_APPLICATION',
        interestStatus: 'Very Interested',
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
        status: 'PROCESSING',
        priority: 'Medium',
        assignedStaff: 'Venkat',
        source: 'WALK_IN',
        interestStatus: 'Interested',
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
        status: 'DOCUMENT_VERIFICATION',
        priority: 'High',
        assignedStaff: 'Harish',
        source: 'REFERRAL',
        interestStatus: 'Very Interested',
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
        status: 'SHORTLISTED',
        priority: 'High',
        assignedStaff: 'Dinesh',
        source: 'ONLINE_APPLICATION',
        interestStatus: 'Very Interested',
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
        status: 'NEW',
        priority: 'Medium',
        assignedStaff: 'Nunciya',
        source: 'PHONE_INQUIRY',
        interestStatus: 'Interested',
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
        status: 'FOLLOW_UP',
        priority: 'Low',
        assignedStaff: 'Venkat',
        source: 'WALK_IN',
        interestStatus: 'Moderately Interested',
        createdAt: new Date('2024-10-11T08:15:45.123Z').toISOString(),
        updatedAt: new Date('2024-10-11T08:15:45.123Z').toISOString()
      },
      {
        id: 7,
        name: 'Rajesh Kumar',
        businessName: 'Kumar Exports',
        mobile: '9876543224',
        email: 'rajesh@kumarexports.com',
        businessType: 'Export',
        loanAmount: 800000,
        district: 'Chennai',
        constitution: 'Private Limited',
        gstStatus: 'Registered',
        capAmount: 80000,
        bankAccount: 'Yes',
        statementDuration: '24 months',
        status: 'APPROVED',
        priority: 'High',
        assignedStaff: 'Perivi',
        source: 'ONLINE_APPLICATION',
        interestStatus: 'Very Interested',
        createdAt: new Date('2024-10-10T14:20:15.789Z').toISOString(),
        updatedAt: new Date('2024-10-10T14:20:15.789Z').toISOString()
      },
      {
        id: 8,
        name: 'Priya Sharma',
        businessName: 'Sharma Consultancy',
        mobile: '9876543225',
        email: 'priya@sharmaconsult.com',
        businessType: 'Services',
        loanAmount: 350000,
        district: 'Bangalore',
        constitution: 'Proprietorship',
        gstStatus: 'Registered',
        capAmount: 35000,
        bankAccount: 'Yes',
        statementDuration: '12 months',
        status: 'PROCESSING',
        priority: 'Medium',
        assignedStaff: 'Harish',
        source: 'REFERRAL',
        interestStatus: 'Interested',
        createdAt: new Date('2024-10-09T11:45:30.456Z').toISOString(),
        updatedAt: new Date('2024-10-09T11:45:30.456Z').toISOString()
      },
      {
        id: 9,
        name: 'Amit Patel',
        businessName: 'Patel Electronics',
        mobile: '9876543226',
        email: 'amit@patelelectronics.com',
        businessType: 'Electronics',
        loanAmount: 600000,
        district: 'Ahmedabad',
        constitution: 'Partnership',
        gstStatus: 'Registered',
        capAmount: 60000,
        bankAccount: 'Yes',
        statementDuration: '15 months',
        status: 'DOCUMENT_VERIFICATION',
        priority: 'High',
        assignedStaff: 'Dinesh',
        source: 'ONLINE_APPLICATION',
        interestStatus: 'Very Interested',
        createdAt: new Date('2024-10-08T09:30:45.123Z').toISOString(),
        updatedAt: new Date('2024-10-08T09:30:45.123Z').toISOString()
      },
      {
        id: 10,
        name: 'Sunita Gupta',
        businessName: 'Gupta Fashion',
        mobile: '9876543227',
        email: 'sunita@guptafashion.com',
        businessType: 'Fashion',
        loanAmount: 450000,
        district: 'Delhi',
        constitution: 'Proprietorship',
        gstStatus: 'Registered',
        capAmount: 45000,
        bankAccount: 'Yes',
        statementDuration: '10 months',
        status: 'SHORTLISTED',
        priority: 'Medium',
        assignedStaff: 'Nunciya',
        source: 'WALK_IN',
        interestStatus: 'Interested',
        createdAt: new Date('2024-10-07T16:15:20.789Z').toISOString(),
        updatedAt: new Date('2024-10-07T16:15:20.789Z').toISOString()
      },
      {
        id: 11,
        name: 'Deepak Verma',
        businessName: 'Verma Construction',
        mobile: '9876543228',
        email: 'deepak@verma.com',
        businessType: 'Construction',
        loanAmount: 850000,
        district: 'Mumbai',
        constitution: 'Private Limited',
        gstStatus: 'Registered',
        capAmount: 85000,
        bankAccount: 'Yes',
        statementDuration: '18 months',
        status: 'NEW',
        priority: 'High',
        assignedStaff: 'Nunciya',
        source: 'ONLINE_APPLICATION',
        interestStatus: 'Very Interested',
        createdAt: new Date('2024-10-06T13:25:15.234Z').toISOString(),
        updatedAt: new Date('2024-10-06T13:25:15.234Z').toISOString()
      },
      {
        id: 12,
        name: 'Neha Agarwal',
        businessName: 'Agarwal Enterprises',
        mobile: '9876543229',
        email: 'neha@agarwal.com',
        businessType: 'Trading',
        loanAmount: 650000,
        district: 'Pune',
        constitution: 'Partnership',
        gstStatus: 'Registered',
        capAmount: 65000,
        bankAccount: 'Yes',
        statementDuration: '15 months',
        status: 'PROCESSING',
        priority: 'Medium',
        assignedStaff: 'Admin User',
        source: 'REFERRAL',
        interestStatus: 'Interested',
        createdAt: new Date('2024-10-05T10:40:30.567Z').toISOString(),
        updatedAt: new Date('2024-10-05T10:40:30.567Z').toISOString()
      },
      {
        id: 13,
        name: 'Rohit Sharma',
        businessName: 'Sharma Industries',
        mobile: '9876543230',
        email: 'rohit@sharma.com',
        businessType: 'Manufacturing',
        loanAmount: 950000,
        district: 'Hyderabad',
        constitution: 'Private Limited',
        gstStatus: 'Registered',
        capAmount: 95000,
        bankAccount: 'Yes',
        statementDuration: '20 months',
        status: 'DOCUMENT_VERIFICATION',
        priority: 'High',
        assignedStaff: 'Admin User',
        source: 'ONLINE_APPLICATION',
        interestStatus: 'Very Interested',
        createdAt: new Date('2024-10-04T15:20:45.890Z').toISOString(),
        updatedAt: new Date('2024-10-04T15:20:45.890Z').toISOString()
      },
      {
        id: 14,
        name: 'Manish Gupta',
        businessName: 'Gupta Tech Solutions',
        mobile: '9876543231',
        email: 'manish@gupta.com',
        businessType: 'Technology',
        loanAmount: 750000,
        district: 'Kolkata',
        constitution: 'Private Limited',
        gstStatus: 'Registered',
        capAmount: 75000,
        bankAccount: 'Yes',
        statementDuration: '12 months',
        status: 'APPROVED',
        priority: 'High',
        assignedStaff: 'Admin User',
        source: 'ONLINE_APPLICATION',
        interestStatus: 'Very Interested',
        createdAt: new Date('2024-10-03T12:10:20.123Z').toISOString(),
        updatedAt: new Date('2024-10-03T12:10:20.123Z').toISOString()
      }
    ];
  }

  // Mock documents data - COMPREHENSIVE LOCALHOST DATA
  static getDocuments() {
    return [
      // BALAMURUGAN's verified documents (Complete set)
      {
        id: 1,
        enquiryId: 1,
        type: 'GST',
        fileName: 'gst-certificate-balamurugan.pdf',
        filePath: '/uploads/documents/1729073400000-1-GST.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-16T11:00:00.000Z').toISOString(),
        createdAt: new Date('2024-10-16T10:45:00.000Z').toISOString(),
        enquiry: { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' }
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
        enquiry: { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' }
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
        enquiry: { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' }
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
        enquiry: { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' }
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
        enquiry: { id: 1, name: 'BALAMURUGAN', mobile: '9876543215', businessType: 'Manufacturing' }
      },

      // VIGNESH S documents (Partial verification)
      {
        id: 6,
        enquiryId: 2,
        type: 'GST',
        fileName: 'gst-certificate-vignesh.pdf',
        filePath: '/uploads/documents/1729073700000-2-GST.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-15T14:30:00.000Z').toISOString(),
        createdAt: new Date('2024-10-15T14:15:00.000Z').toISOString(),
        enquiry: { id: 2, name: 'VIGNESH S', mobile: '9876543220', businessType: 'Trading' }
      },
      {
        id: 7,
        enquiryId: 2,
        type: 'UDYAM',
        fileName: 'udyam-certificate-vignesh.pdf',
        filePath: '/uploads/documents/1729073760000-2-UDYAM.pdf',
        verified: false,
        createdAt: new Date('2024-10-15T14:20:00.000Z').toISOString(),
        enquiry: { id: 2, name: 'VIGNESH S', mobile: '9876543220', businessType: 'Trading' }
      },
      {
        id: 8,
        enquiryId: 2,
        type: 'BANK_STATEMENT',
        fileName: 'bank-statement-vignesh.pdf',
        filePath: '/uploads/documents/1729073800000-2-BANK_STATEMENT.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-15T14:45:00.000Z').toISOString(),
        createdAt: new Date('2024-10-15T14:25:00.000Z').toISOString(),
        enquiry: { id: 2, name: 'VIGNESH S', mobile: '9876543220', businessType: 'Trading' }
      },

      // Poorani documents (Mixed verification status)
      {
        id: 9,
        enquiryId: 3,
        type: 'GST',
        fileName: 'gst-certificate-poorani.pdf',
        filePath: '/uploads/documents/1729073820000-3-GST.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-14T16:45:00.000Z').toISOString(),
        createdAt: new Date('2024-10-14T16:30:00.000Z').toISOString(),
        enquiry: { id: 3, name: 'Poorani', mobile: '9876543221', businessType: 'Textiles' }
      },
      {
        id: 10,
        enquiryId: 3,
        type: 'BANK_STATEMENT',
        fileName: 'bank-statement-poorani.pdf',
        filePath: '/uploads/documents/1729073880000-3-BANK_STATEMENT.pdf',
        verified: false,
        createdAt: new Date('2024-10-14T16:35:00.000Z').toISOString(),
        enquiry: { id: 3, name: 'Poorani', mobile: '9876543221', businessType: 'Textiles' }
      },
      {
        id: 11,
        enquiryId: 3,
        type: 'UDYAM',
        fileName: 'udyam-certificate-poorani.pdf',
        filePath: '/uploads/documents/1729073900000-3-UDYAM.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-14T17:00:00.000Z').toISOString(),
        createdAt: new Date('2024-10-14T16:40:00.000Z').toISOString(),
        enquiry: { id: 3, name: 'Poorani', mobile: '9876543221', businessType: 'Textiles' }
      },

      // Manigandan M documents (Complete set - ready for shortlist)
      {
        id: 12,
        enquiryId: 4,
        type: 'GST',
        fileName: 'gst-certificate-manigandan.pdf',
        filePath: '/uploads/documents/1729073950000-4-GST.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-13T12:30:00.000Z').toISOString(),
        createdAt: new Date('2024-10-13T12:15:00.000Z').toISOString(),
        enquiry: { id: 4, name: 'Manigandan M', mobile: '9876543222', businessType: 'Manufacturing' }
      },
      {
        id: 13,
        enquiryId: 4,
        type: 'UDYAM',
        fileName: 'udyam-certificate-manigandan.pdf',
        filePath: '/uploads/documents/1729074000000-4-UDYAM.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-13T12:45:00.000Z').toISOString(),
        createdAt: new Date('2024-10-13T12:20:00.000Z').toISOString(),
        enquiry: { id: 4, name: 'Manigandan M', mobile: '9876543222', businessType: 'Manufacturing' }
      },
      {
        id: 14,
        enquiryId: 4,
        type: 'BANK_STATEMENT',
        fileName: 'bank-statement-manigandan.pdf',
        filePath: '/uploads/documents/1729074050000-4-BANK_STATEMENT.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-13T13:00:00.000Z').toISOString(),
        createdAt: new Date('2024-10-13T12:25:00.000Z').toISOString(),
        enquiry: { id: 4, name: 'Manigandan M', mobile: '9876543222', businessType: 'Manufacturing' }
      },
      {
        id: 15,
        enquiryId: 4,
        type: 'OWNER_PAN',
        fileName: 'owner-pan-manigandan.pdf',
        filePath: '/uploads/documents/1729074100000-4-OWNER_PAN.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-13T13:15:00.000Z').toISOString(),
        createdAt: new Date('2024-10-13T12:30:00.000Z').toISOString(),
        enquiry: { id: 4, name: 'Manigandan M', mobile: '9876543222', businessType: 'Manufacturing' }
      },
      {
        id: 16,
        enquiryId: 4,
        type: 'AADHAR',
        fileName: 'aadhar-manigandan.pdf',
        filePath: '/uploads/documents/1729074150000-4-AADHAR.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-13T13:30:00.000Z').toISOString(),
        createdAt: new Date('2024-10-13T12:35:00.000Z').toISOString(),
        enquiry: { id: 4, name: 'Manigandan M', mobile: '9876543222', businessType: 'Manufacturing' }
      },

      // Rajesh Kumar documents (Complete and verified)
      {
        id: 17,
        enquiryId: 7,
        type: 'GST',
        fileName: 'gst-certificate-rajesh.pdf',
        filePath: '/uploads/documents/1729074200000-7-GST.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-10T15:30:00.000Z').toISOString(),
        createdAt: new Date('2024-10-10T15:15:00.000Z').toISOString(),
        enquiry: { id: 7, name: 'Rajesh Kumar', mobile: '9876543224', businessType: 'Export' }
      },
      {
        id: 18,
        enquiryId: 7,
        type: 'UDYAM',
        fileName: 'udyam-certificate-rajesh.pdf',
        filePath: '/uploads/documents/1729074250000-7-UDYAM.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-10T15:45:00.000Z').toISOString(),
        createdAt: new Date('2024-10-10T15:20:00.000Z').toISOString(),
        enquiry: { id: 7, name: 'Rajesh Kumar', mobile: '9876543224', businessType: 'Export' }
      },
      {
        id: 19,
        enquiryId: 7,
        type: 'BANK_STATEMENT',
        fileName: 'bank-statement-rajesh.pdf',
        filePath: '/uploads/documents/1729074300000-7-BANK_STATEMENT.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-10T16:00:00.000Z').toISOString(),
        createdAt: new Date('2024-10-10T15:25:00.000Z').toISOString(),
        enquiry: { id: 7, name: 'Rajesh Kumar', mobile: '9876543224', businessType: 'Export' }
      },
      {
        id: 20,
        enquiryId: 7,
        type: 'OWNER_PAN',
        fileName: 'owner-pan-rajesh.pdf',
        filePath: '/uploads/documents/1729074350000-7-OWNER_PAN.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-10T16:15:00.000Z').toISOString(),
        createdAt: new Date('2024-10-10T15:30:00.000Z').toISOString(),
        enquiry: { id: 7, name: 'Rajesh Kumar', mobile: '9876543224', businessType: 'Export' }
      },

      // Priya Sharma documents (In progress)
      {
        id: 21,
        enquiryId: 8,
        type: 'GST',
        fileName: 'gst-certificate-priya.pdf',
        filePath: '/uploads/documents/1729074400000-8-GST.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-09T12:30:00.000Z').toISOString(),
        createdAt: new Date('2024-10-09T12:15:00.000Z').toISOString(),
        enquiry: { id: 8, name: 'Priya Sharma', mobile: '9876543225', businessType: 'Services' }
      },
      {
        id: 22,
        enquiryId: 8,
        type: 'BANK_STATEMENT',
        fileName: 'bank-statement-priya.pdf',
        filePath: '/uploads/documents/1729074450000-8-BANK_STATEMENT.pdf',
        verified: false,
        createdAt: new Date('2024-10-09T12:20:00.000Z').toISOString(),
        enquiry: { id: 8, name: 'Priya Sharma', mobile: '9876543225', businessType: 'Services' }
      },

      // Amit Patel documents (Under verification)
      {
        id: 23,
        enquiryId: 9,
        type: 'GST',
        fileName: 'gst-certificate-amit.pdf',
        filePath: '/uploads/documents/1729074500000-9-GST.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-08T10:30:00.000Z').toISOString(),
        createdAt: new Date('2024-10-08T10:15:00.000Z').toISOString(),
        enquiry: { id: 9, name: 'Amit Patel', mobile: '9876543226', businessType: 'Electronics' }
      },
      {
        id: 24,
        enquiryId: 9,
        type: 'UDYAM',
        fileName: 'udyam-certificate-amit.pdf',
        filePath: '/uploads/documents/1729074550000-9-UDYAM.pdf',
        verified: false,
        createdAt: new Date('2024-10-08T10:20:00.000Z').toISOString(),
        enquiry: { id: 9, name: 'Amit Patel', mobile: '9876543226', businessType: 'Electronics' }
      },
      {
        id: 25,
        enquiryId: 9,
        type: 'BANK_STATEMENT',
        fileName: 'bank-statement-amit.pdf',
        filePath: '/uploads/documents/1729074600000-9-BANK_STATEMENT.pdf',
        verified: true,
        verifiedAt: new Date('2024-10-08T11:00:00.000Z').toISOString(),
        createdAt: new Date('2024-10-08T10:25:00.000Z').toISOString(),
        enquiry: { id: 9, name: 'Amit Patel', mobile: '9876543226', businessType: 'Electronics' }
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
        staff: 'Perivi',
        interestStatus: 'Very Interested',
        priority: 'High',
        notes: 'Complete documentation verified, ready for processing',
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
      },
      {
        id: 4,
        enquiryId: 4,
        name: 'Manigandan M',
        mobile: '9876543222',
        businessName: 'Manigandan Industries',
        businessNature: 'Manufacturing',
        businessType: 'Manufacturing',
        loanAmount: 1000000,
        district: 'Salem',
        constitution: 'Private Limited',
        gstStatus: 'Registered',
        capAmount: 100000,
        bankAccount: 'Yes',
        statementDuration: '18 months',
        staff: 'Dinesh',
        interestStatus: 'Very Interested',
        priority: 'High',
        notes: 'Large loan amount, excellent business profile',
        createdAt: new Date('2024-10-13T15:30:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-13T15:30:00.000Z').toISOString(),
        enquiry: {
          id: 4,
          name: 'Manigandan M',
          mobile: '9876543222',
          businessType: 'Manufacturing',
          businessName: 'Manigandan Industries'
        }
      },
      {
        id: 5,
        enquiryId: 7,
        name: 'Rajesh Kumar',
        mobile: '9876543224',
        businessName: 'Kumar Exports',
        businessNature: 'Export',
        businessType: 'Export',
        loanAmount: 800000,
        district: 'Chennai',
        constitution: 'Private Limited',
        gstStatus: 'Registered',
        capAmount: 80000,
        bankAccount: 'Yes',
        statementDuration: '24 months',
        staff: 'Perivi',
        interestStatus: 'Very Interested',
        priority: 'High',
        notes: 'Export business with strong financials',
        createdAt: new Date('2024-10-10T16:30:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-10T16:30:00.000Z').toISOString(),
        enquiry: {
          id: 7,
          name: 'Rajesh Kumar',
          mobile: '9876543224',
          businessType: 'Export',
          businessName: 'Kumar Exports'
        }
      },
      {
        id: 6,
        enquiryId: 10,
        name: 'Sunita Gupta',
        mobile: '9876543227',
        businessName: 'Gupta Fashion',
        businessNature: 'Fashion',
        businessType: 'Fashion',
        loanAmount: 450000,
        district: 'Delhi',
        constitution: 'Proprietorship',
        gstStatus: 'Registered',
        capAmount: 45000,
        bankAccount: 'Yes',
        statementDuration: '10 months',
        staff: 'Nunciya',
        interestStatus: 'Interested',
        priority: 'Medium',
        notes: 'Fashion business with seasonal variations',
        createdAt: new Date('2024-10-07T18:00:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-07T18:00:00.000Z').toISOString(),
        enquiry: {
          id: 10,
          name: 'Sunita Gupta',
          mobile: '9876543227',
          businessType: 'Fashion',
          businessName: 'Gupta Fashion'
        }
      }
    ];
  }

  // Mock payment gateway data - COMPREHENSIVE LOCALHOST DATA
  static getPaymentGateway() {
    return [
      {
        id: 1,
        shortlistId: 1,
        loanAmount: 500000,
        tenure: 24,
        interestRate: 12.5,
        status: 'APPROVED',
        processingFee: 25000,
        emi: 23500,
        createdAt: new Date('2024-10-16T13:00:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-16T13:00:00.000Z').toISOString(),
        shortlist: {
          id: 1,
          name: 'BALAMURUGAN',
          mobile: '9876543215',
          businessName: 'Balamurugan Enterprises',
          businessType: 'Manufacturing',
          loanAmount: 500000,
          enquiry: {
            id: 1,
            name: 'BALAMURUGAN',
            mobile: '9876543215',
            businessType: 'Manufacturing',
            businessName: 'Balamurugan Enterprises'
          }
        },
        submittedBy: {
          id: 1,
          name: 'Perivi',
          email: 'gowthaamankrishna1998@gmail.com'
        }
      },
      {
        id: 2,
        shortlistId: 5,
        loanAmount: 800000,
        tenure: 36,
        interestRate: 11.5,
        status: 'PROCESSING',
        processingFee: 40000,
        emi: 26800,
        createdAt: new Date('2024-10-14T15:30:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-14T15:30:00.000Z').toISOString(),
        shortlist: {
          id: 5,
          name: 'Rajesh Kumar',
          mobile: '9876543224',
          businessName: 'Kumar Exports',
          businessType: 'Export',
          loanAmount: 800000,
          enquiry: {
            id: 7,
            name: 'Rajesh Kumar',
            mobile: '9876543224',
            businessType: 'Export',
            businessName: 'Kumar Exports'
          }
        },
        submittedBy: {
          id: 1,
          name: 'Perivi',
          email: 'gowthaamankrishna1998@gmail.com'
        }
      },
      {
        id: 3,
        shortlistId: 4,
        loanAmount: 1000000,
        tenure: 48,
        interestRate: 13.0,
        status: 'PENDING',
        processingFee: 50000,
        emi: 27000,
        createdAt: new Date('2024-10-13T17:00:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-13T17:00:00.000Z').toISOString(),
        shortlist: {
          id: 4,
          name: 'Manigandan M',
          mobile: '9876543222',
          businessName: 'Manigandan Industries',
          businessType: 'Manufacturing',
          loanAmount: 1000000,
          enquiry: {
            id: 4,
            name: 'Manigandan M',
            mobile: '9876543222',
            businessType: 'Manufacturing',
            businessName: 'Manigandan Industries'
          }
        },
        submittedBy: {
          id: 4,
          name: 'Dinesh',
          email: 'dinesh@gmail.com'
        }
      },
      {
        id: 4,
        shortlistId: 3,
        loanAmount: 750000,
        tenure: 30,
        interestRate: 12.0,
        status: 'UNDER_REVIEW',
        processingFee: 37500,
        emi: 26200,
        createdAt: new Date('2024-10-12T14:45:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-12T14:45:00.000Z').toISOString(),
        shortlist: {
          id: 3,
          name: 'Poorani',
          mobile: '9876543221',
          businessName: 'Poorani Textiles',
          businessType: 'Textiles',
          loanAmount: 750000,
          enquiry: {
            id: 3,
            name: 'Poorani',
            mobile: '9876543221',
            businessType: 'Textiles',
            businessName: 'Poorani Textiles'
          }
        },
        submittedBy: {
          id: 3,
          name: 'Harish',
          email: 'newacttmis@gmail.com'
        }
      },
      {
        id: 5,
        shortlistId: 6,
        loanAmount: 450000,
        tenure: 24,
        interestRate: 13.5,
        status: 'REJECTED',
        processingFee: 22500,
        emi: 20100,
        rejectionReason: 'Insufficient business turnover',
        createdAt: new Date('2024-10-10T11:20:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-10T11:20:00.000Z').toISOString(),
        shortlist: {
          id: 6,
          name: 'Sunita Gupta',
          mobile: '9876543227',
          businessName: 'Gupta Fashion',
          businessType: 'Fashion',
          loanAmount: 450000,
          enquiry: {
            id: 10,
            name: 'Sunita Gupta',
            mobile: '9876543227',
            businessType: 'Fashion',
            businessName: 'Gupta Fashion'
          }
        },
        submittedBy: {
          id: 5,
          name: 'Nunciya',
          email: 'tmsnunciya59@gmail.com'
        }
      }
    ];
  }

  // Mock staff data - UPDATED STAFF MEMBERS WITH CLIENT ASSIGNMENTS
  static getStaff() {
    return [
      {
        id: 1,
        name: 'Perivi',
        email: 'gowthaamankrishna1998@gmail.com',
        password: '12345678', // From screenshot
        role: 'ADMIN',
        department: 'Management',
        verified: true,
        hasAccess: true,
        status: 'ACTIVE',
        clientName: 'Rajesh Kumar, Priya Sharma, Amit Patel',
        createdAt: new Date('2024-10-01T09:00:00.000Z').toISOString()
      },
      {
        id: 2,
        name: 'Venkat',
        email: 'gowthaamaneswar1998@gmail.com',
        password: '12345678', // From screenshot
        role: 'EMPLOYEE',
        department: 'Operations',
        verified: true,
        hasAccess: true,
        status: 'ACTIVE',
        clientName: 'Sunita Gupta, Vikram Singh',
        createdAt: new Date('2024-10-02T10:00:00.000Z').toISOString()
      },
      {
        id: 3,
        name: 'Harish',
        email: 'newacttmis@gmail.com',
        password: '12345678', // From screenshot
        role: 'ADMIN',
        department: 'Client Management',
        verified: true,
        hasAccess: true,
        status: 'ACTIVE',
        clientName: 'Anita Desai, Ravi Mehta, Sanjay Joshi',
        createdAt: new Date('2024-10-03T11:00:00.000Z').toISOString()
      },
      {
        id: 4,
        name: 'Dinesh',
        email: 'dinesh@gmail.com',
        password: '12345678', // From screenshot
        role: 'EMPLOYEE',
        department: 'Processing',
        verified: true,
        hasAccess: true,
        status: 'ACTIVE',
        clientName: 'Available for Assignment - Ready for New Clients',
        createdAt: new Date('2024-10-04T12:00:00.000Z').toISOString()
      },
      {
        id: 5,
        name: 'Nunciya',
        email: 'tmsnunciya59@gmail.com',
        password: '12345678', // From screenshot
        role: 'ADMIN',
        department: 'Administration',
        verified: true,
        hasAccess: true,
        status: 'ACTIVE',
        clientName: 'Deepak Verma',
        createdAt: new Date('2024-10-05T13:00:00.000Z').toISOString()
      },
      {
        id: 6,
        name: 'Admin User',
        email: 'admin@businessloan.com',
        password: '12345678', // From screenshot
        role: 'ADMIN',
        department: 'Administration',
        verified: true,
        hasAccess: true,
        status: 'ACTIVE',
        clientName: 'Neha Agarwal, Rohit Sharma',
        createdAt: new Date('2024-10-06T14:00:00.000Z').toISOString()
      },
      {
        id: 7,
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: '12345678', // From screenshot
        role: 'ADMIN',
        department: 'Administration',
        verified: true,
        hasAccess: true,
        status: 'ACTIVE',
        clientName: 'Manish Gupta',
        createdAt: new Date('2024-10-07T15:00:00.000Z').toISOString()
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

  // Mock transactions data - COMPREHENSIVE LOCALHOST DATA
  static getTransactions() {
    return [
      {
        id: 1001,
        name: 'BALAMURUGAN Payment',
        transactionId: 'TXN202410001',
        amount: 500000,
        status: 'COMPLETED',
        date: new Date('2024-10-15T10:30:00.000Z').toISOString(),
        clientName: 'BALAMURUGAN',
        businessType: 'Manufacturing',
        processedBy: 'Perivi',
        createdAt: new Date('2024-10-15T10:30:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-15T10:30:00.000Z').toISOString()
      },
      {
        id: 1002,
        name: 'Rajesh Kumar Payment',
        transactionId: 'TXN202410002',
        amount: 800000,
        status: 'COMPLETED',
        date: new Date('2024-10-14T14:20:00.000Z').toISOString(),
        clientName: 'Rajesh Kumar',
        businessType: 'Export',
        processedBy: 'Perivi',
        createdAt: new Date('2024-10-14T14:20:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-14T14:20:00.000Z').toISOString()
      },
      {
        id: 1003,
        name: 'Manigandan M Payment',
        transactionId: 'TXN202410003',
        amount: 1000000,
        status: 'PENDING',
        date: new Date('2024-10-13T16:45:00.000Z').toISOString(),
        clientName: 'Manigandan M',
        businessType: 'Manufacturing',
        processedBy: 'Dinesh',
        createdAt: new Date('2024-10-13T16:45:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-13T16:45:00.000Z').toISOString()
      },
      {
        id: 1004,
        name: 'Poorani Processing Fee',
        transactionId: 'TXN202410004',
        amount: 75000,
        status: 'COMPLETED',
        date: new Date('2024-10-12T11:15:00.000Z').toISOString(),
        clientName: 'Poorani',
        businessType: 'Textiles',
        processedBy: 'Harish',
        createdAt: new Date('2024-10-12T11:15:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-12T11:15:00.000Z').toISOString()
      },
      {
        id: 1005,
        name: 'VIGNESH S Payment',
        transactionId: 'TXN202410005',
        amount: 300000,
        status: 'PENDING',
        date: new Date('2024-10-11T09:30:00.000Z').toISOString(),
        clientName: 'VIGNESH S',
        businessType: 'Trading',
        processedBy: 'Venkat',
        createdAt: new Date('2024-10-11T09:30:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-11T09:30:00.000Z').toISOString()
      },
      {
        id: 1006,
        name: 'Priya Sharma Application Fee',
        transactionId: 'TXN202410006',
        amount: 35000,
        status: 'COMPLETED',
        date: new Date('2024-10-10T13:20:00.000Z').toISOString(),
        clientName: 'Priya Sharma',
        businessType: 'Services',
        processedBy: 'Harish',
        createdAt: new Date('2024-10-10T13:20:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-10T13:20:00.000Z').toISOString()
      },
      {
        id: 1007,
        name: 'Amit Patel Payment',
        transactionId: 'TXN202410007',
        amount: 600000,
        status: 'FAILED',
        date: new Date('2024-10-09T15:45:00.000Z').toISOString(),
        clientName: 'Amit Patel',
        businessType: 'Electronics',
        processedBy: 'Dinesh',
        createdAt: new Date('2024-10-09T15:45:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-09T15:45:00.000Z').toISOString()
      },
      {
        id: 1008,
        name: 'Sunita Gupta Payment',
        transactionId: 'TXN202410008',
        amount: 450000,
        status: 'PENDING',
        date: new Date('2024-10-08T12:10:00.000Z').toISOString(),
        clientName: 'Sunita Gupta',
        businessType: 'Fashion',
        processedBy: 'Nunciya',
        createdAt: new Date('2024-10-08T12:10:00.000Z').toISOString(),
        updatedAt: new Date('2024-10-08T12:10:00.000Z').toISOString()
      }
    ];
  }

  // Mock notifications data - COMPREHENSIVE SYSTEM ACTIVITIES
  static getNotifications() {
    return [
      {
        id: 'notif_1',
        type: 'NEW_ENQUIRY',
        title: 'New Enquiry Received',
        message: 'New enquiry from BALAMURUGAN (Manufacturing) for ₹5,00,000 business loan received',
        priority: 'HIGH',
        read: false,
        createdAt: new Date('2024-10-16T10:37:11.406Z').toISOString(),
        data: {
          enquiryId: 1,
          clientName: 'BALAMURUGAN',
          loanAmount: 500000,
          businessType: 'Manufacturing'
        }
      },
      {
        id: 'notif_2',
        type: 'DOCUMENT_UPLOADED',
        title: 'Document Uploaded',
        message: 'GST Certificate uploaded by BALAMURUGAN - awaiting verification',
        priority: 'MEDIUM',
        read: false,
        createdAt: new Date('2024-10-16T10:45:00.000Z').toISOString(),
        data: {
          documentId: 1,
          clientName: 'BALAMURUGAN',
          documentType: 'GST'
        }
      },
      {
        id: 'notif_3',
        type: 'DOCUMENT_VERIFIED',
        title: 'Document Verified',
        message: 'Bank Statement verified for Rajesh Kumar - all documents complete',
        priority: 'MEDIUM',
        read: false,
        createdAt: new Date('2024-10-15T14:20:00.000Z').toISOString(),
        data: {
          documentId: 19,
          clientName: 'Rajesh Kumar',
          documentType: 'BANK_STATEMENT'
        }
      },
      {
        id: 'notif_4',
        type: 'SHORTLISTED',
        title: 'Client Shortlisted',
        message: 'Manigandan M has been added to shortlist for ₹10,00,000 loan',
        priority: 'HIGH',
        read: false,
        createdAt: new Date('2024-10-13T15:30:00.000Z').toISOString(),
        data: {
          shortlistId: 4,
          clientName: 'Manigandan M',
          loanAmount: 1000000
        }
      },
      {
        id: 'notif_5',
        type: 'PAYMENT_APPLIED',
        title: 'Payment Gateway Application',
        message: 'Poorani applied for ₹7,50,000 loan through payment gateway',
        priority: 'HIGH',
        read: false,
        createdAt: new Date('2024-10-12T14:45:00.000Z').toISOString(),
        data: {
          paymentId: 4,
          clientName: 'Poorani',
          loanAmount: 750000
        }
      },
      {
        id: 'notif_6',
        type: 'TRANSACTION_COMPLETED',
        title: 'Transaction Completed',
        message: 'Payment of ₹5,00,000 completed for BALAMURUGAN',
        priority: 'HIGH',
        read: true,
        createdAt: new Date('2024-10-15T10:30:00.000Z').toISOString(),
        data: {
          transactionId: 1001,
          clientName: 'BALAMURUGAN',
          amount: 500000
        }
      },
      {
        id: 'notif_7',
        type: 'STAFF_ADDED',
        title: 'New Staff Member',
        message: 'Dinesh added as EMPLOYEE in Processing department',
        priority: 'LOW',
        read: true,
        createdAt: new Date('2024-10-04T12:00:00.000Z').toISOString(),
        data: {
          staffId: 4,
          staffName: 'Dinesh',
          role: 'EMPLOYEE'
        }
      },
      {
        id: 'notif_8',
        type: 'NEW_ENQUIRY',
        title: 'New Enquiry Received',
        message: 'New enquiry from Priya Sharma for ₹3,50,000 services business loan',
        priority: 'HIGH',
        read: true,
        createdAt: new Date('2024-10-09T11:45:30.000Z').toISOString(),
        data: {
          enquiryId: 8,
          clientName: 'Priya Sharma',
          loanAmount: 350000,
          businessType: 'Services'
        }
      },
      {
        id: 'notif_9',
        type: 'DOCUMENT_UPLOADED',
        title: 'Document Uploaded',
        message: 'UDYAM Registration uploaded by Amit Patel - pending verification',
        priority: 'MEDIUM',
        read: true,
        createdAt: new Date('2024-10-08T10:20:00.000Z').toISOString(),
        data: {
          documentId: 24,
          clientName: 'Amit Patel',
          documentType: 'UDYAM'
        }
      },
      {
        id: 'notif_10',
        type: 'PAYMENT_REJECTED',
        title: 'Payment Application Rejected',
        message: 'Sunita Gupta loan application rejected - insufficient business turnover',
        priority: 'MEDIUM',
        read: true,
        createdAt: new Date('2024-10-10T11:20:00.000Z').toISOString(),
        data: {
          paymentId: 5,
          clientName: 'Sunita Gupta',
          rejectionReason: 'Insufficient business turnover'
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
