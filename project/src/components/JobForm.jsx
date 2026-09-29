export default function JobForm() {
  return (
    <form className="job-form">
      <input placeholder="Company Name" />
      <input placeholder="Role" />
      <select>
        <option>Applied</option>
        <option>Interview</option>
        <option>Offer</option>
        <option>Rejected</option>
      </select>
      <button>Add Job</button>
    </form>
  );
}
