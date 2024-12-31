import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function About() {
  return (
    <div className="-page">
      <div className="skills-container">
        <div className="skills-text">
          <h1>
            <span>Skills</span>
          </h1>
          <h1>
            <span className="link">
            <Link href="/resume" className="resume-link">
              Resume
            </Link>
            </span>
          </h1>
        </div>

        <div className="skills">
          <div className="skill-category">
            <h3>JavaScript:</h3>
            <ul className="skill-list">
              <li>• Web Deployment</li>
              <li>• React, JSX</li>
              <li>• TypeScript</li>
              <li>• 3D with Babylon</li>
              <li>• Managing Packages</li>
            </ul>
          </div>
          <div className="skill-category">
            <h3>Python:</h3>
            <ul className="skill-list">
              <li>• File Management</li>
              <li>• Socket Networking</li>
              <li>• Machine Learning</li>
              <li>• Data Visualization</li>
              <li>• Raspberry Pi</li>
            </ul>
          </div>
          <div className="skill-category">
            <h3>Web Stack:</h3>
            <ul className="skill-list">
              <li>• Back-end, Front-end</li>
              <li>• HTML5, CSS</li>
              <li>• JavaScript</li>
              <li>• PHP, Apache, SQL</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

  );
}
