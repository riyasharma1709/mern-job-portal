export default function JobCard({ company, role, status, onStatusChange }) {
  const statuses = [
    'Pending', 'Reviewed', 'Accepted', 'Rejected',
    'Interviewing', 'Hired', 'Offer Received', 'Not Selected by Employer'
  ];

  return (
    <div className="job-card">
      <div className="job-card-header">
        <h3>{company}</h3>
        <p>{role}</p>
      </div>
      <div className="job-card-actions">
        <select 
          className={`status-select status-${(status || 'Pending').toLowerCase().replace(/\s+/g, '-')}`}
          value={status || 'Pending'}
          onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
        >
          {statuses.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>    
    </div>
  );
}
