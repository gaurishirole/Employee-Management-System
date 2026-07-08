import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FileText, Printer, Download, Eye, Send, RotateCcw, Minus, Plus, Undo2, Redo2, Cloud, RefreshCw, PenTool, Mail, X } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'
import logoImg from '../assets/TDTL_logo.png'

const GenerateLetterModule = () => {
  const { toast } = useNotification()
  
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Form states
  const [empType, setEmpType] = useState('Full-Time')
  const [category, setCategory] = useState('Offer Letter')
  const [position, setPosition] = useState('Intern – Software Engineer Trainer')
  const [gender, setGender] = useState('Male')
  
  const [empName, setEmpName] = useState('Gauri Shirote')
  const [startDate, setStartDate] = useState('16th Sept 2024')
  const [endDate, setEndDate] = useState('16th March 2025')
  const [genDate, setGenDate] = useState('Sept 18th , 2024')
  
  // Salary/CTC fields
  const [ctc, setCtc] = useState('3,40,000')
  const [ctcWords, setCtcWords] = useState('Three Lakh Forty Thousand Rupees Only')
  const [ctcShort, setCtcShort] = useState('3.4 Lacs')
  const [fixedSalary, setFixedSalary] = useState('3 Lacs')
  const [variableSalary, setVariableSalary] = useState('40,000')
  const [variablePerQuarter, setVariablePerQuarter] = useState('10,000')

  const [hrName, setHrName] = useState('Dr. Amit Andre')
  const [hrDesignation, setHrDesignation] = useState('CEO')
  const [sigFile, setSigFile] = useState(null)

  // Email Modal States
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('Purva Sanjay Jadhav (hr) - purv075@gmail.com')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSigFile(URL.createObjectURL(e.target.files[0]))
      toast.success('Signature uploaded successfully!')
    }
  }

  const handleGenerate = () => {
    toast.success('Letter generated and updated in PDF preview panel!')
  }

  const handleSend = () => {
    const defaultSubject = `${category} - ${empName || 'Candidate'}`;
    const defaultBody = `Dear ${empName || 'Candidate'},\n\nPlease find attached your ${category} for the position of ${position || 'Intern – Software Engineer Trainer'}.\n\nSincerely,\n\n${hrName || 'Dr. Amit Andre'}\n${hrDesignation || 'CEO'}\n${hrName ? 'The DataTech Labs Inc' : ''}`;
    
    setEmailSubject(defaultSubject);
    setEmailBody(defaultBody);
    setIsEmailModalOpen(true);
  }

  const handleDownload = () => {
    toast.success('Opening print dialog. Select "Save as PDF" to save it to your computer.');
    setTimeout(() => {
      window.print();
    }, 300);
  }  // Header Letterhead Template
  const PageHeader = () => (
    <div className="relative flex flex-col items-center pb-2 mb-4 w-full z-10">
      <img src={logoImg} alt="The DataTech Labs Logo" className="h-14 object-contain w-auto mb-1.5" />
      <div className="w-full bg-[#391bc4] text-white text-center py-1.5 text-[9px] uppercase tracking-[0.2em] font-black rounded-sm">
        Empowering Transformation
      </div>
      <div className="w-full h-[1px] bg-slate-200 mt-2"></div>
    </div>
  )

  const PrintPageHeader = () => (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingBottom: '8px',
      marginBottom: '16px',
      width: '100%',
      zIndex: 10
    }}>
      <img src={logoImg} alt="The DataTech Labs Logo" style={{ height: '56px', width: 'auto', marginBottom: '6px', objectFit: 'contain' }} />
      <div style={{
        width: '100%',
        backgroundColor: '#391bc4',
        color: '#ffffff',
        textAlign: 'center',
        padding: '6px 0',
        fontSize: '9px',
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        fontWeight: '900',
        borderRadius: '2px'
      }}>
        Empowering Transformation
      </div>
      <div style={{ width: '100%', height: '1px', backgroundColor: '#e2e8f0', marginTop: '8px' }}></div>
    </div>
  )

  // Footer Template
  const PageFooter = () => (
    <div className="mt-4 border-t border-slate-200 pt-2 flex flex-col items-center w-full relative z-10">
      {/* Purple Strip */}
      <div className="w-full bg-[#391bc4] text-white px-4 py-2 flex items-center justify-between text-[10px] font-bold rounded-sm">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-0.5">🌐 www.tdtl.world</span>
          <span className="flex items-center gap-0.5">📞 020-40055025</span>
          <span className="flex items-center gap-0.5">✉️ empower@tdtl.world</span>
        </div>
        <div className="flex items-center gap-1.5">
          {/* QR Code */}
          <div className="w-7 h-7 bg-white p-0.5 rounded-sm">
            <div className="grid grid-cols-3 gap-0.5 w-full h-full bg-slate-900"></div>
          </div>
          <div className="w-10 h-5 bg-purple-900 rounded-sm"></div>
        </div>
      </div>
      <div className="text-center text-[10px] font-extrabold text-slate-600 mt-1 leading-normal">
        <p>Dnyanasha Technology Solutions India Private Limited</p>
        <p className="text-slate-400 font-bold uppercase tracking-wider mt-0.5 text-[8.5px]">INDIA | USA | UAE | UK</p>
      </div>
    </div>
  )

  const PrintPageFooter = () => (
    <div style={{
      marginTop: '16px',
      borderTop: '1px solid #e2e8f0',
      paddingTop: '8px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Purple Strip */}
      <div style={{
        width: '100%',
        backgroundColor: '#391bc4',
        color: '#ffffff',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '10px',
        fontWeight: 'bold',
        borderRadius: '2px',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>🌐 www.tdtl.world</span>
          <span>📞 020-40055025</span>
          <span>✉️ empower@tdtl.world</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* QR Code */}
          <div style={{ width: '28px', height: '28px', backgroundColor: '#ffffff', padding: '2px', borderRadius: '2px', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', height: '100%', backgroundColor: '#0f172a' }}></div>
          </div>
          <div style={{ width: '40px', height: '20px', backgroundColor: '#581c87', borderRadius: '2px' }}></div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: '800', color: '#475569', marginTop: '4px', lineHeight: '1.4' }}>
        <p style={{ margin: 0 }}>Dnyanasha Technology Solutions India Private Limited</p>
        <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '8.5px' }}>
          INDIA | USA | UAE | UK
        </p>
      </div>
    </div>
  )

  // Mesh overlay pattern representing network nodes/mesh
  const MeshOverlay = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.05]">
      {/* Top Left nodes */}
      <svg className="absolute -top-4 -left-4 w-60 h-60" viewBox="0 0 100 100">
        <circle cx="20" cy="20" r="2" fill="#391bc4" />
        <circle cx="50" cy="15" r="2.5" fill="#f43f5e" />
        <circle cx="15" cy="60" r="2" fill="#06b6d4" />
        <circle cx="70" cy="55" r="3" fill="#391bc4" />
        <line x1="20" y1="20" x2="50" y2="15" stroke="#000" strokeWidth="0.5" />
        <line x1="20" y1="20" x2="15" y2="60" stroke="#000" strokeWidth="0.5" />
        <line x1="50" y1="15" x2="70" y2="55" stroke="#000" strokeWidth="0.5" />
        <line x1="15" y1="60" x2="70" y2="55" stroke="#000" strokeWidth="0.5" />
      </svg>
      {/* Bottom Right nodes */}
      <svg className="absolute -bottom-4 -right-4 w-60 h-60" viewBox="0 0 100 100">
        <circle cx="80" cy="80" r="2" fill="#391bc4" />
        <circle cx="50" cy="85" r="2.5" fill="#f43f5e" />
        <circle cx="85" cy="40" r="2" fill="#06b6d4" />
        <circle cx="30" cy="45" r="3" fill="#391bc4" />
        <line x1="80" y1="80" x2="50" y2="85" stroke="#000" strokeWidth="0.5" />
        <line x1="80" y1="80" x2="85" y2="40" stroke="#000" strokeWidth="0.5" />
        <line x1="50" y1="85" x2="30" y2="45" stroke="#000" strokeWidth="0.5" />
        <line x1="85" y1="40" x2="30" y2="45" stroke="#000" strokeWidth="0.5" />
      </svg>
    </div>
  )

  const PrintMeshOverlay = () => (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', opacity: 0.05 }}>
      {/* Top Left nodes */}
      <svg style={{ position: 'absolute', top: '-16px', left: '-16px', width: '240px', height: '240px' }} viewBox="0 0 100 100">
        <circle cx="20" cy="20" r="2" fill="#391bc4" />
        <circle cx="50" cy="15" r="2.5" fill="#f43f5e" />
        <circle cx="15" cy="60" r="2" fill="#06b6d4" />
        <circle cx="70" cy="55" r="3" fill="#391bc4" />
        <line x1="20" y1="20" x2="50" y2="15" stroke="#000" strokeWidth="0.5" />
        <line x1="20" y1="20" x2="15" y2="60" stroke="#000" strokeWidth="0.5" />
        <line x1="50" y1="15" x2="70" y2="55" stroke="#000" strokeWidth="0.5" />
        <line x1="15" y1="60" x2="70" y2="55" stroke="#000" strokeWidth="0.5" />
      </svg>
      {/* Bottom Right nodes */}
      <svg style={{ position: 'absolute', bottom: '-16px', right: '-16px', width: '240px', height: '240px' }} viewBox="0 0 100 100">
        <circle cx="80" cy="80" r="2" fill="#391bc4" />
        <circle cx="50" cy="85" r="2.5" fill="#f43f5e" />
        <circle cx="85" cy="40" r="2" fill="#06b6d4" />
        <circle cx="30" cy="45" r="3" fill="#391bc4" />
        <line x1="80" y1="80" x2="50" y2="85" stroke="#000" strokeWidth="0.5" />
        <line x1="80" y1="80" x2="85" y2="40" stroke="#000" strokeWidth="0.5" />
        <line x1="50" y1="85" x2="30" y2="45" stroke="#000" strokeWidth="0.5" />
        <line x1="85" y1="40" x2="30" y2="45" stroke="#000" strokeWidth="0.5" />
      </svg>
    </div>
  )

  // Helper to get letter text dynamically based on selected Category and Employee Type
  const getLetterContent = () => {
    const defaultSubject = `Internship Offer Letter for the Position of ${position || 'Intern – Software Engineer Trainer'}`;
    
    if (category === 'Offer Letter') {
      if (empType === 'Intern') {
        return {
          subject: `Internship Offer Letter for the Position of ${position || 'Intern – Software Engineer Trainer'}`,
          page1: (
            <>
              <p className="text-slate-700">
                We are pleased to extend an offer to join <strong>The DataTech Labs Inc</strong> as an {position || 'Intern – Software Engineer Trainer'}. We are excited about the possibility of you contributing to our projects and are confident that this internship will be a valuable experience for your professional growth.
              </p>
              <div>
                <p className="font-extrabold text-slate-800 mb-0.5">Internship Details:</p>
                <ul className="list-disc pl-4 space-y-0.5 font-semibold text-slate-700">
                  <li><strong>Position:</strong> {position || 'Intern – Software Engineer Trainer'}</li>
                  <li><strong>Duration:</strong> 6 months</li>
                  <li><strong>Start Date:</strong> {startDate || '16th Sept 2024'}</li>
                  <li><strong>End Date:</strong> {endDate || '16th March 2025'}</li>
                </ul>
              </div>
              <div>
                <p className="font-extrabold text-slate-800 mb-0.5">Compensation:</p>
                <ul className="list-disc pl-4 space-y-0.5 font-semibold text-slate-700">
                  <li>Unpaid Period: The first 3 months of the internship will be unpaid.</li>
                  <li>Paid Period: The following 3 months will be paid. The stipend will be As per Performance.</li>
                </ul>
              </div>
              <div>
                <p className="font-extrabold text-slate-800 mb-0.5">Performance-Based Placement Offer:</p>
                <p className="text-slate-700">
                  At the end of the 6-month internship, based on your performance, a placement offer may be extended to you. Your performance will be evaluated based on your contributions to the projects, adherence to timelines, and overall professionalism.
                </p>
              </div>
              <div>
                <p className="font-extrabold text-slate-800 mb-0.5">Roles and Responsibilities:</p>
                <ol className="list-decimal pl-4 space-y-0.5 font-semibold text-slate-700">
                  <li><strong>Project Participation:</strong> Work closely with your assigned team to complete projects within the designated timelines.</li>
                  <li><strong>Organizational Standards:</strong> Adhere to the standard rules and regulations of the organization.</li>
                  <li><strong>Discipline:</strong> Maintain a high level of discipline in all aspects of your work.</li>
                  <li><strong>Data Security:</strong> Ensure data security and confidentiality for all tasks and projects you are involved in.</li>
                </ol>
              </div>
            </>
          ),
          page2: (
            <>
              <div>
                <p className="font-extrabold text-slate-800 mb-0.5">Working Hours:</p>
                <p className="text-slate-700">
                  You are expected to work from 9:00 AM to 6:00 PM, Monday to Friday. Flexibility may be required depending on project needs.
                </p>
              </div>
              <div>
                <p className="font-extrabold text-slate-800 mb-0.5">Confidentiality Agreement:</p>
                <p className="text-slate-700">
                  As an intern at <strong>The DataTech Labs Inc</strong>, you will have access to sensitive and proprietary information. You are required to maintain the confidentiality of all company information and not disclose any details to unauthorized parties.
                </p>
              </div>
              <div>
                <p className="font-extrabold text-slate-800 mb-0.5">Acceptance:</p>
                <p className="text-slate-700">
                  Please sign and return a copy of this letter to confirm your acceptance of this offer by <strong>{startDate || '19th Sept 2024'}</strong>. If you have any questions, please feel free to contact us at hrops@tdtl.world
                </p>
              </div>
              <p className="text-slate-750 font-bold pt-1">
                We are looking forward to having you join our team and are excited about the contributions you will make.
              </p>
            </>
          ),
          isOffer: true
        };
      } else {
        // Full-Time / Part-Time / Contract Offer Letter
        return {
          subject: `${empType} Employment Offer Letter for the Position of ${position}`,
          page1: (
            <>
              <p className="text-slate-700">
                We are pleased to extend an offer of employment for the position of <strong>{position}</strong> with <strong>The DataTech Labs Inc</strong>. We are impressed by your qualifications and look forward to you joining our organization.
              </p>
              <div>
                <p className="font-extrabold text-slate-800 mb-0.5">Employment Details:</p>
                <ul className="list-disc pl-4 space-y-0.5 font-semibold text-slate-700">
                  <li><strong>Position:</strong> {position}</li>
                  <li><strong>Type:</strong> {empType}</li>
                  <li><strong>Start Date:</strong> {startDate || '16th Sept 2024'}</li>
                  <li><strong>Annual CTC:</strong> INR {ctc} ({ctcWords})</li>
                </ul>
              </div>
              <div>
                <p className="font-extrabold text-slate-800 mb-0.5">Salary Component Breakdown:</p>
                <ul className="list-disc pl-4 space-y-0.5 font-semibold text-slate-700">
                  <li>Fixed Compensation: INR {fixedSalary} per annum.</li>
                  <li>Variable / Performance Incentive: INR {variableSalary} per annum (payable quarterly at INR {variablePerQuarter}).</li>
                </ul>
              </div>
              <div>
                <p className="font-extrabold text-slate-800 mb-0.5">Roles and Responsibilities:</p>
                <ol className="list-decimal pl-4 space-y-0.5 font-semibold text-slate-700">
                  <li><strong>Core Duties:</strong> Execute responsibilities aligned with your role as {position} and complete assigned projects.</li>
                  <li><strong>Code of Conduct:</strong> Adhere to professional discipline, confidentiality guidelines, and security policies.</li>
                  <li><strong>Resource Allocation:</strong> Optimize team contribution and maintain positive corporate representation.</li>
                </ol>
              </div>
            </>
          ),
          page2: (
            <>
              <div>
                <p className="font-extrabold text-slate-800 mb-0.5">Probation and Confirmation:</p>
                <p className="text-slate-700">
                  You will be on a probation period of 3 months from the date of joining. Upon successful evaluation of your performance during this period, your employment will be formally confirmed.
                </p>
              </div>
              <div>
                <p className="font-extrabold text-slate-800 mb-0.5">Notice Period & Termination:</p>
                <p className="text-slate-700">
                  During probation, either party may terminate the employment with a 15-day notice. Post confirmation, the notice period will be 30 days or salary in lieu thereof.
                </p>
              </div>
              <div>
                <p className="font-extrabold text-slate-800 mb-0.5">Acceptance of Offer:</p>
                <p className="text-slate-700">
                  To confirm your acceptance, please sign and return a copy of this letter by <strong>{startDate || '16th Sept 2024'}</strong>.
                </p>
              </div>
              <p className="text-slate-750 font-bold pt-1">
                We welcome you to The DataTech Labs Inc and wish you a rewarding career journey with us.
              </p>
            </>
          ),
          isOffer: true
        };
      }
    } else if (category === 'Joining Letter') {
      return {
        subject: `Appointment & Joining Letter for the Position of ${position}`,
        page1: (
          <>
            <p className="text-slate-700">
              This is with reference to your acceptance of our employment offer. We are pleased to confirm your appointment and formal joining as <strong>{position}</strong> with <strong>The DataTech Labs Inc</strong>, effective <strong>{startDate}</strong>.
            </p>
            <div>
              <p className="font-extrabold text-slate-800 mb-0.5">Details of Appointment:</p>
              <ul className="list-disc pl-4 space-y-0.5 font-semibold text-slate-700">
                <li><strong>Official Designation:</strong> {position}</li>
                <li><strong>Date of Joining:</strong> {startDate}</li>
                <li><strong>Reporting Authority:</strong> CEO / Executive Team</li>
                <li><strong>Work Location:</strong> Pune Corporate Office</li>
              </ul>
            </div>
            <div>
              <p className="font-extrabold text-slate-800 mb-0.5">Submission of Joining Documents:</p>
              <p className="text-slate-700">
                On your first day, you are required to submit copies of educational certificates, identity proofs (PAN/Aadhaar), relocation proofs (if applicable), and a relieving certificate or letter of release from your last employer.
              </p>
            </div>
            <div>
              <p className="font-extrabold text-slate-800 mb-0.5">Terms of Employment:</p>
              <p className="text-slate-700">
                Your compensation and standard terms of service will align with the agreement outlined in your signed Offer Letter. You will be bound by the company's employee handbook, operations policies, and code of conduct.
              </p>
            </div>
          </>
        ),
        page2: (
          <>
            <div>
              <p className="font-extrabold text-slate-800 mb-0.5">Workplace Integrity & Conduct:</p>
              <p className="text-slate-700">
                You are expected to perform your duties with high professionalism, maintain strict confidentiality concerning project specifications, and respect intellectual property rights.
              </p>
            </div>
            <div>
              <p className="font-extrabold text-slate-800 mb-0.5">Performance Standards:</p>
              <p className="text-slate-700">
                Your contributions will be assessed periodically against designated deliverables, team collaboration indices, and operational discipline.
              </p>
            </div>
            <p className="text-slate-750 font-bold pt-1">
              We look forward to your valuable contributions to our engineering pipeline.
            </p>
          </>
        ),
        isOffer: false
      };
    } else if (category === 'Experience Certificate') {
      return {
        subject: `TO WHOMSOEVER IT MAY CONCERN`,
        page1: (
          <>
            <p className="text-slate-700 text-justify pt-4">
              This is to certify that <strong>{empName}</strong> was employed with <strong>The DataTech Labs Inc</strong> as a <strong>{position}</strong> from <strong>{startDate}</strong> to <strong>{endDate}</strong>.
            </p>
            <p className="text-slate-700 text-justify">
              During {gender === 'Male' ? 'his' : 'her'} tenure of service with us, we found {empName} to be highly dedicated, sincere, and professional in handling {gender === 'Male' ? 'his' : 'her'} deliverables. {gender === 'Male' ? 'He' : 'She'} successfully managed multiple client briefs and contributed key modules to our technical development pipeline.
            </p>
            <p className="text-slate-700 text-justify">
              {gender === 'Male' ? 'His' : 'Her'} code quality, adherence to schedules, and collaborative approach made {gender === 'Male' ? 'him' : 'her'} a reliable team asset. {gender === 'Male' ? 'He' : 'She'} demonstrated solid problem-solving capabilities and maintained healthy work relationships.
            </p>
          </>
        ),
        page2: (
          <>
            <p className="text-slate-750 text-justify pt-2">
              {gender === 'Male' ? 'His' : 'Her'} character and conduct have been exemplary. We express our appreciation for {gender === 'Male' ? 'his' : 'her'} contributions and wish {gender === 'Male' ? 'him' : 'her'} all the success in {gender === 'Male' ? 'his' : 'her'} future professional endeavors.
            </p>
          </>
        ),
        isOffer: false
      };
    } else if (category === 'Relieving Letter') {
      return {
        subject: `Relieving Letter & Character Certificate`,
        page1: (
          <>
            <p className="text-slate-700 text-justify">
              Dear <strong>{empName}</strong>,
            </p>
            <p className="text-slate-700 text-justify">
              This has reference to your resignation from the services of <strong>The DataTech Labs Inc</strong>. We wish to inform you that your resignation has been accepted and you are officially relieved from the position of <strong>{position}</strong>, effective close of business hours on <strong>{endDate}</strong>.
            </p>
            <div>
              <p className="font-extrabold text-slate-800 mb-0.5">Details of Release:</p>
              <ul className="list-disc pl-4 space-y-0.5 font-semibold text-slate-700">
                <li><strong>Designation:</strong> {position}</li>
                <li><strong>Effective Date of Separation:</strong> {endDate}</li>
                <li><strong>Company Asset Return:</strong> Completed & Verified</li>
                <li><strong>Full and Final Settlement:</strong> Successfully Cleared</li>
              </ul>
            </div>
          </>
        ),
        page2: (
          <>
            <p className="text-slate-700 text-justify">
              We place on record our appreciation for the services rendered by you during your tenure and wish you the absolute best in your future career milestones.
            </p>
          </>
        ),
        isOffer: false
      };
    }
    return { subject: defaultSubject, page1: null, page2: null, isOffer: true };
  };

  const letterData = getLetterContent();

  return (
    <div className="w-full space-y-6 pb-12 px-4 md:px-0">
      <style>{`
        @page {
          size: A4;
          margin: 0 !important;
        }
        @media print {
          /* Hide main app entirely */
          #root {
            display: none !important;
          }

          /* Reset body and html */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            width: 210mm !important;
            height: auto !important;
            overflow: visible !important;
          }

          #print-letter-root {
            display: flex !important;
            flex-direction: column !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .print-page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
          
          .print-no-page-break {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          /* Precise print resets for text inside the portal */
          #print-letter-root p {
            margin-top: 0 !important;
            margin-bottom: 6px !important;
            line-height: 1.4 !important;
            font-size: 10.5px !important;
            font-family: sans-serif !important;
            color: #334155 !important;
          }

          #print-letter-root strong {
            font-weight: 700 !important;
            color: #0f172a !important;
          }

          #print-letter-root ul,
          #print-letter-root ol {
            margin-top: 0 !important;
            margin-bottom: 6px !important;
            padding-left: 18px !important;
          }

          #print-letter-root li {
            margin-bottom: 3px !important;
            line-height: 1.4 !important;
            font-size: 10.5px !important;
            font-family: sans-serif !important;
            color: #334155 !important;
          }

          #print-letter-root li strong {
            color: #0f172a !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }

        @media screen {
          #print-letter-root {
            display: none !important;
          }
          .scale-container {
            zoom: 0.58;
            height: 651px; /* 1123px * 0.58 = 651px */
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
            border-radius: 12px;
            background: white;
          }
          .page-sheet {
            width: 210mm;
            height: 297mm;
            min-height: 297mm;
            background: white;
            padding: 20mm 15mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
          }
        }
      `}</style>

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-50 text-cyan-500 rounded-2xl shadow-sm border border-cyan-100">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#0c6396] dark:text-[#38bdf8] tracking-tight">
              Generate Letter
            </h1>
            <p className="text-xs text-cyan-500 font-bold mt-0.5">
              Create official letters dynamically
            </p>
          </div>
        </div>
      </div>

      {/* Main Parameters Form & PDF Viewer Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Parameters Form */}
        <div className="lg:col-span-6 space-y-6 bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
          
          {/* Classification */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Employee Type
              </label>
              <select
                value={empType}
                onChange={(e) => setEmpType(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Intern">Intern</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Choose Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
              >
                <option value="Offer Letter">Offer Letter</option>
                <option value="Joining Letter">Joining Letter</option>
                <option value="Experience Certificate">Experience Certificate</option>
                <option value="Relieving Letter">Relieving Letter</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Position
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
              >
                <option value="Intern – Software Engineer Trainer">Intern – Software Engineer Trainer</option>
                <option value="Digital Marketing Executive">Digital Marketing Executive</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Senior Developer">Senior Developer</option>
                <option value="HR Manager">HR Manager</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Employee Details Section */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-sm font-extrabold text-[#0c6396] tracking-tight">Employee Details</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Employee Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Miss. Eram Hamid Satkut"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. 16th Sept 2024"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  End Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. 16th March 2025"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Letter Generated Date
                </label>
                <input
                  type="text"
                  value={genDate}
                  onChange={(e) => setGenDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  CTC (e.g. 3,40,000)
                </label>
                <input
                  type="text"
                  value={ctc}
                  onChange={(e) => setCtc(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  CTC in Words
                </label>
                <input
                  type="text"
                  value={ctcWords}
                  onChange={(e) => setCtcWords(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  CTC Short (e.g. 3.4 Lacs)
                </label>
                <input
                  type="text"
                  value={ctcShort}
                  onChange={(e) => setCtcShort(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Fixed Salary (e.g. 3 Lacs)
                </label>
                <input
                  type="text"
                  value={fixedSalary}
                  onChange={(e) => setFixedSalary(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Variable Salary (e.g. 40,000)
                </label>
                <input
                  type="text"
                  value={variableSalary}
                  onChange={(e) => setVariableSalary(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Variable Per Quarter
                </label>
                <input
                  type="text"
                  value={variablePerQuarter}
                  onChange={(e) => setVariablePerQuarter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* HR Details Section */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-sm font-extrabold text-[#0c6396] tracking-tight">HR Details</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  HR Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Amit Andre"
                  value={hrName}
                  onChange={(e) => setHrName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  HR Designation
                </label>
                <input
                  type="text"
                  value={hrDesignation}
                  onChange={(e) => setHrDesignation(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Upload HR Signature
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-[#f8fafc] text-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-[#0c6396]/10 file:text-[#0c6396]"
              />
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={handleGenerate}
              className="flex-1 py-3 px-4 bg-[#0c6396] hover:bg-[#0a527c] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none"
            >
              <Eye size={14} /> Generate Letter
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-white"
            >
              <Download size={14} /> Download PDF
            </button>
            <button
              onClick={handleSend}
              className="flex-1 py-3 px-4 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none"
            >
              <Send size={14} /> Send Letter
            </button>
          </div>
        </div>

        {/* Right Side: Embedded PDF Reader Mockup */}
        <div className="lg:col-span-6 bg-[#333333] rounded-[2rem] overflow-hidden shadow-lg border border-slate-700 h-[780px] flex flex-col justify-between">
          
          {/* Reader Topbar controls */}
          <div className="h-12 bg-[#222222] border-b border-slate-800 flex items-center justify-between px-6 text-slate-400 text-[10px] font-bold">
            <div className="flex items-center gap-4">
              <span className="bg-[#444444] text-white px-2 py-0.5 rounded font-black text-[9px]">1 / 2</span>
              <span className="w-[1px] h-4 bg-slate-800"></span>
              <div className="flex gap-2">
                <button className="p-1 hover:text-white transition-colors cursor-pointer bg-transparent border-none"><Minus size={12} /></button>
                <button className="p-1 hover:text-white transition-colors cursor-pointer bg-transparent border-none"><Plus size={12} /></button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-1.5 hover:text-white hover:bg-slate-850 rounded transition-colors cursor-pointer bg-transparent border-none" title="Reload"><RefreshCw size={12} /></button>
              <button className="p-1.5 hover:text-white hover:bg-slate-850 rounded transition-colors cursor-pointer bg-transparent border-none" title="Pen"><PenTool size={12} /></button>
              <button className="p-1.5 hover:text-white hover:bg-slate-850 rounded transition-colors cursor-pointer bg-transparent border-none" title="Undo"><Undo2 size={12} /></button>
              <button className="p-1.5 hover:text-white hover:bg-slate-850 rounded transition-colors cursor-pointer bg-transparent border-none" title="Redo"><Redo2 size={12} /></button>
              <button className="p-1.5 hover:text-white hover:bg-slate-850 rounded transition-colors cursor-pointer bg-transparent border-none" title="Cloud Save"><Cloud size={12} /></button>
              <button onClick={handleDownload} className="p-1.5 hover:text-white hover:bg-slate-850 rounded transition-colors cursor-pointer bg-transparent border-none" title="Download"><Download size={12} /></button>
              <button onClick={() => window.print()} className="p-1.5 hover:text-white hover:bg-slate-850 rounded transition-colors cursor-pointer bg-transparent border-none" title="Print"><Printer size={12} /></button>
            </div>
          </div>

          {/* Reader Content Body (Dark Gray Canvas showing both page sheets) */}
          <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 items-center bg-[#4e4e4e]">
            {/* Visual Mockup for Screen Only (using scale-container zoom) */}
            <div className="flex flex-col gap-6 items-center w-full">
              
              {/* ================= PAGE 1 ================= */}
              <div className="scale-container">
                <div className="page-sheet relative text-slate-800 font-sans leading-relaxed">
                  {/* Mesh Overlays */}
                  <MeshOverlay />
                  
                  {/* Large Watermark in center */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
                    <img src={logoImg} alt="TDTL Watermark" className="w-[380px] object-contain rotate-[-15deg]" />
                  </div>

                  {/* Header Letterhead */}
                  <div>
                    <PageHeader />

                    {/* Sender Address Block */}
                    <div className="text-left text-xs text-slate-600 font-bold leading-normal mb-5 relative z-10">
                      <p className="font-extrabold text-[#0a5c85] text-sm">The DataTech Labs Inc</p>
                      <p>Pune, Maharashtra, India</p>
                      <p>Phone: +91-8237727106</p>
                      <p>Email: hrops@tdtl.world</p>
                      <p className="mt-1.5 text-slate-700 font-extrabold">Date: {genDate || 'Sept 18th , 2024'}</p>
                    </div>

                    {/* Recipient details */}
                    <div className="mb-4 text-sm relative z-10">
                      <p className="font-extrabold text-slate-800">{empName || 'Gauri Shirote'},</p>
                      <p className="text-slate-500 font-semibold">Pune, Maharashtra, India</p>
                    </div>

                    <div className="space-y-3.5 text-xs relative z-10 leading-relaxed text-slate-700">
                      <p className="font-extrabold text-slate-800 text-sm">Dear {empName || 'Gauri Shirote'},</p>

                      <p className="font-extrabold text-slate-850 text-sm uppercase tracking-wide">
                        Subject: {letterData.subject}
                      </p>

                      {letterData.page1}
                    </div>
                  </div>

                  {/* Page Footer */}
                  <PageFooter />
                </div>
              </div>

              {/* ================= PAGE 2 ================= */}
              <div className="scale-container">
                <div className="page-sheet relative text-slate-800 font-sans leading-relaxed">
                  {/* Mesh Overlays */}
                  <MeshOverlay />
                  
                  {/* Large Watermark in center */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
                    <img src={logoImg} alt="TDTL Watermark" className="w-[380px] object-contain rotate-[-15deg]" />
                  </div>

                  {/* Header Letterhead */}
                  <div>
                    <PageHeader />

                    <div className="space-y-3 pt-1 text-xs relative z-10 leading-relaxed text-slate-700">
                      {letterData.page2}
                    </div>
                  </div>

                  {/* Footer signature signoff */}
                  <div className="text-xs relative z-10">
                    <p className="font-bold text-slate-500 mb-1">Sincerely,</p>
                    
                    {/* Signature file display */}
                    <div className="my-2 h-14 flex items-center gap-6">
                      {sigFile ? (
                        <img src={sigFile} alt="HR Signature" className="h-12 object-contain" />
                      ) : (
                        <div className="w-24 h-10 border border-dashed border-slate-200 rounded flex items-center justify-center text-[9px] text-slate-350 font-bold uppercase tracking-wider">
                          Signature
                        </div>
                      )}
                      {/* Seal circle mockup */}
                      <div className="w-14 h-14 rounded-full border-2 border-double border-[#0a5c85] flex flex-col items-center justify-center text-[6px] font-black text-[#0a5c85] leading-none text-center">
                        <p>DNYANASHA</p>
                        <p className="text-[5px] text-slate-400 my-0.5">PVT LTD</p>
                        <p>INDIA</p>
                      </div>
                    </div>

                    <div className="pt-1 w-72">
                      <p className="font-extrabold text-slate-800 text-sm">{hrName || 'Dr. Amit Andre'}</p>
                      <p className="text-slate-400 text-xs font-semibold">{hrDesignation || 'CEO'}</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">Contact Number: +91-8237727106</p>
                      <p className="text-xs text-[#0a5c85] font-bold">Email ID: hrops@tdtl.world</p>
                    </div>

                    {/* Acceptance of Offer block */}
                    {letterData.isOffer && (
                      <div className="mt-4 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                        <p className="font-black text-slate-800 text-xs uppercase tracking-wider mb-1">Acceptance of Offer:</p>
                        <p className="text-slate-600 font-semibold text-xs leading-relaxed">
                          I, <strong>{empName || 'Gauri Shirote'}</strong>, accept the offer for the position of <strong>{position || 'Intern – Software Engineer Trainer'}</strong> at <strong>The DataTech Labs Inc</strong>. I understand and agree to the terms and conditions outlined in this offer letter.
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-6 text-slate-500 font-bold text-xs">
                          <p>Signature: ___________________________</p>
                          <p>Date: ________________________________</p>
                        </div>
                      </div>
                    )}

                    {/* Page Footer */}
                    <PageFooter />
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Portaled Print-Only Version (directly under body for perfect print isolation) */}
      {mounted && createPortal(
        <div id="print-letter-root" style={{ width: '210mm', display: 'none' }}>
          {/* ================= PAGE 1 ================= */}
          <div className="print-page-break" style={{
            width: '210mm',
            height: '297mm',
            minHeight: '297mm',
            boxSizing: 'border-box',
            position: 'relative',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20mm 15mm',
            fontFamily: 'sans-serif'
          }}>
            <PrintMeshOverlay />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.035,
              pointerEvents: 'none',
              userSelect: 'none'
            }}>
              <img src={logoImg} alt="TDTL Watermark" style={{ width: '380px', objectFit: 'contain', transform: 'rotate(-15deg)' }} />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <PrintPageHeader />
              
              {/* Sender Address Block */}
              <div style={{
                textAlign: 'left',
                fontSize: '11px',
                color: '#475569',
                fontWeight: 'bold',
                lineHeight: '1.4',
                marginBottom: '20px',
                position: 'relative',
                zIndex: 10
              }}>
                <p style={{ fontWeight: '800', color: '#0a5c85', fontSize: '13px', margin: '0 0 2px 0' }}>The DataTech Labs Inc</p>
                <p style={{ margin: 0 }}>Pune, Maharashtra, India</p>
                <p style={{ margin: 0 }}>Phone: +91-8237727106</p>
                <p style={{ margin: 0 }}>Email: hrops@tdtl.world</p>
                <p style={{ marginTop: '6px', color: '#334155', fontWeight: '800', margin: '6px 0 0 0' }}>Date: {genDate || 'Sept 18th , 2024'}</p>
              </div>

              {/* Recipient details */}
              <div style={{ marginBottom: '16px', fontSize: '12px', position: 'relative', zIndex: 10 }}>
                <p style={{ fontWeight: '800', color: '#1e293b', margin: '0 0 2px 0' }}>{empName || 'Gauri Shirote'},</p>
                <p style={{ color: '#64748b', fontWeight: '600', margin: 0 }}>Pune, Maharashtra, India</p>
              </div>

              {/* Subject & Body */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '11px',
                position: 'relative',
                zIndex: 10,
                lineHeight: '1.5',
                color: '#334155'
              }}>
                <p style={{ fontWeight: '800', color: '#1e293b', fontSize: '12px', margin: 0 }}>Dear {empName || 'Gauri Shirote'},</p>
                <p style={{ fontWeight: '800', color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>
                  Subject: {letterData.subject}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {letterData.page1}
                </div>
              </div>
            </div>

            <PrintPageFooter />
          </div>

          {/* ================= PAGE 2 ================= */}
          <div className="print-no-page-break" style={{
            width: '210mm',
            height: '297mm',
            minHeight: '297mm',
            boxSizing: 'border-box',
            position: 'relative',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20mm 15mm',
            fontFamily: 'sans-serif'
          }}>
            <PrintMeshOverlay />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.035,
              pointerEvents: 'none',
              userSelect: 'none'
            }}>
              <img src={logoImg} alt="TDTL Watermark" style={{ width: '380px', objectFit: 'contain', transform: 'rotate(-15deg)' }} />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <PrintPageHeader />
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '11px',
                position: 'relative',
                zIndex: 10,
                lineHeight: '1.5',
                color: '#334155',
                paddingTop: '4px'
              }}>
                {letterData.page2}
              </div>
            </div>

            {/* Footer signature signoff */}
            <div style={{ fontSize: '11px', position: 'relative', zIndex: 10 }}>
              <p style={{ fontWeight: 'bold', color: '#64748b', marginBottom: '4px', margin: 0 }}>Sincerely,</p>
              
              {/* Signature file display */}
              <div style={{ margin: '8px 0', height: '56px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                {sigFile ? (
                  <img src={sigFile} alt="HR Signature" style={{ height: '48px', objectFit: 'contain' }} />
                ) : (
                  <div style={{
                    width: '96px',
                    height: '40px',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    color: '#94a3b8',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                  }}>
                    Signature
                  </div>
                )}
                {/* Seal circle mockup */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  border: '2px double #0a5c85',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '6px',
                  fontWeight: '900',
                  color: '#0a5c85',
                  lineHeight: '1',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}>
                  <p style={{ margin: 0 }}>DNYANASHA</p>
                  <p style={{ fontSize: '5px', color: '#94a3b8', margin: '2px 0' }}>PVT LTD</p>
                  <p style={{ margin: 0 }}>INDIA</p>
                </div>
              </div>

              <div style={{ paddingTop: '4px', width: '288px' }}>
                <p style={{ fontWeight: '800', color: '#1e293b', fontSize: '12px', margin: '0 0 2px 0' }}>{hrName || 'Dr. Amit Andre'}</p>
                <p style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', margin: 0 }}>{hrDesignation || 'CEO'}</p>
                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '2px', margin: '2px 0 0 0' }}>Contact Number: +91-8237727106</p>
                <p style={{ fontSize: '11px', color: '#0a5c85', fontWeight: 'bold', margin: 0 }}>Email ID: hrops@tdtl.world</p>
              </div>

              {/* Acceptance of Offer block */}
              {letterData.isOffer && (
                <div style={{
                  marginTop: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px',
                  backgroundColor: 'rgba(248, 250, 252, 0.5)'
                }}>
                  <p style={{ fontWeight: '900', color: '#1e293b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 4px 0' }}>
                    Acceptance of Offer:
                  </p>
                  <p style={{ color: '#475569', fontWeight: '600', fontSize: '11px', lineHeight: '1.5', margin: 0 }}>
                    I, <strong>{empName || 'Gauri Shirote'}</strong>, accept the offer for the position of <strong>{position || 'Intern – Software Engineer Trainer'}</strong> at <strong>The DataTech Labs Inc</strong>. I understand and agree to the terms and conditions outlined in this offer letter.
                  </p>
                  <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', color: '#64748b', fontWeight: 'bold', fontSize: '11px' }}>
                    <p style={{ margin: 0 }}>Signature: ___________________________</p>
                    <p style={{ margin: 0 }}>Date: ________________________________</p>
                  </div>
                </div>
              )}

              <PrintPageFooter />
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Send Email Modal Form */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-[440px] shadow-2xl relative border border-slate-100 flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#ecfdf5] border border-emerald-100 flex items-center justify-center text-[#10b981] shadow-sm">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0c6396] tracking-tight leading-snug">Send Email</h3>
                  <p className="text-xs text-cyan-500 font-bold tracking-wide mt-0.5">Send {category} to employee</p>
                </div>
              </div>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer bg-transparent border-none"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-black text-[#0c6396] uppercase tracking-widest mb-1.5">
                  Select Recipient
                </label>
                <select
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
                >
                  <option value="Purva Sanjay Jadhav (hr) - purv075@gmail.com">Purva Sanjay Jadhav (hr) - purv075@gmail.com</option>
                  <option value="candidate@tdtl.world">candidate@tdtl.world</option>
                  <option value="hrops@tdtl.world">hrops@tdtl.world</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#0c6396] uppercase tracking-widest mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-[#f8fafc] text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-bold shadow-sm"
                  placeholder="Subject"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#0c6396] uppercase tracking-widest mb-1.5">
                  Body (Optional)
                </label>
                <textarea
                  rows={4}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-2xl bg-[#f8fafc] text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#0c6396]/20 font-semibold shadow-sm resize-none"
                  placeholder="Add custom email message..."
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                const mailtoLink = `mailto:${encodeURIComponent(recipientEmail.split(' - ').pop())}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                window.location.href = mailtoLink;
                setIsEmailModalOpen(false);
                toast.success('Email client opened successfully!');
              }}
              className="w-full py-3.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-emerald-200/50 flex items-center justify-center gap-2 transition-all cursor-pointer border-none"
            >
              <Send size={16} /> Send Now
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GenerateLetterModule
