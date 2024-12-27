

export default function About() {
    return (
        <div className="-page">
          <div className="skills">
            <h1>Skills</h1>
            <div className="skill-category">
              <h3>JavaScript:</h3>
              <ul className="skill-list">
                <li>• Application Engineering and Depoloyment (React + JSX)</li>
                <li>• Database API and Management (sqlite3 + JSON + Express) </li>
                <li>• Package and Deploy to Cloud Services (Babel + Webpack + Dependencies) </li>
                <li>• 3D Animations and Interactivity (Babylon + Three.js)</li>
                <li>• Quick HTML Modifications (jQuery) </li>
                <li>• Add Static Typing to JS (TypeScript)</li>
                <li>• Managing Dependencies and Accessing Database on Server-side API(Node + npm)</li>
              </ul>
            </div>
            <div className="skill-category">
            <h3>Python:</h3>
            <ul className="skill-list">
              <li>• Data Management, Data Type Conversion, File Names Management</li>
              <li>• Socket-based Networking (socket, default library)</li>
              <li>• Machine Learning (TensorFlow)</li>
              <li>• Error Logging, Test Automation,  (assert + pytest)</li>
              <li>• Data Visualization (GraphQL + matplotlib)</li>
              <li>• Data Compression &Encryption (zlib + cryptography)</li>
              <li>• Virtual Environments (venv)</li>
              <li>• Library Management (pip)</li>
              <li>• Raspberry Pi 2B+ and 3B+ (Electrical Engineering + Python)</li>
            </ul>
          </div>
          <div className="skill-category">
            <h3>Web Stack:</h3>
            <ul className="skill-list">
              <li>• HTML5 (Ole Reliable)</li>
              <li>• Reusable Styles and Animations (CSS & Exensions)</li>
              <li>• Front-end and Back-end Scripting (JavaScript + React)</li>
              <li>• API Design (JavaScript, PHP, JSON, SQL)</li>
              <li>• Bootstrap (Rapid Web Development)</li>
              <li>• Website Migration (Location and Dependencies)</li>
              <li>• User Experience Design (Graphic Design and Accessibility)</li>
            </ul>
          </div>
          <div className="skill-category">
            <h3>LAMP Stack:</h3>
            <ul className="skill-list">
              <li>• MariaDB (SQL) Database Management</li>
              <li>• PHP & Apache Web Applications (LAMP + XAMPP)</li>
              <li>• Linux BASH & Terminal Commands (Pop!_OS)</li>
            </ul>
          </div>
          <div className="skill-category">
            <h3>Git:</h3>
            <ul className="skill-list">
              <li>• Version Control & Pull Requests</li>
              <li>• Branch Management</li>
              <li>• Team Coordination</li>
              <li>• Terminal Commands in CMD and PowerShell</li>
              <li>• Push, Pull, Merge, Fetch, Checkout</li>
            </ul>
          </div>
          <div className="skill-category">
            <h3>Graphic Design:</h3>
            <ul className="skill-list">
              <li>• Adobe Illustrator Vector Design</li>
              <li>• Adobe Photoshop Image Editing</li>
              <li>• Web Application Wireframing</li>
              <li>• User Interface Design</li>
            </ul>
          </div>
          <div className="skill-category">
            <h3>Tools & Design Patterns:</h3>
            <ul className="skill-list">
              <li>• Kanban (Azure DevOps, Github)</li>
              <li>• Agile (Responsive Team Structure with Incremenetal Improvements)</li>
              <li>• Scrum (Team Collaboration + Feedback)</li>
              <li>• CI/CD (Continuous Delivery Towards Production)</li>
              <li>• Microservices (Small Interoperating Systems)</li>
              <li>• A/B Testing (Version Comparison, Data or Site Migration)</li>
            </ul>
          </div>
          <div className="skill-category">
            <h3>C:</h3>
            <ul className="skill-list">
              <li>• Basic Application Design (C + C++)</li>
              <li>• Basic GUI (ImGUI))</li>
              <li>• Basic GUI in Visual Studio (C# + WPF))</li>
            </ul>
          </div>
          <div className="skill-category">
            <h3>3D:</h3>
            <ul className="skill-list">
              <li>• Rendering to Web (Three.js + Babylon + webGL)</li>
              <li>• DirectX (3D Desktop Rendering)</li>
            </ul>
          </div>
        </div>
        <div className="resume">
          <h1>Check Out my Actual Resume</h1>
          <object
            data="/Tobie Rathbun Resume August 2024.pdf"
            type="application/pdf"
            width="100%"
            height="600px">
            <p>Your browser does not support viewing PDFs. <a href="/Tobie Rathbun Resume August 2024.pdf">Download the resume</a>.</p>
          </object>
        </div>
      </div>
    );
}
