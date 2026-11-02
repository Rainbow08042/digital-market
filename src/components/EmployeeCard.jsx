import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories } from '../data/catalog';
import { employeeMedia } from '../data/media';
import EmployeeImage from './EmployeeImage';

export default function EmployeeCard({ employee }) {
  const category = categories.find(item => item.id === employee.category);
  const item = employeeMedia(employee);
  return <article className="employee-card" data-employee-id={employee.id} aria-label={employee.title}>
    <EmployeeImage key={item.image} item={item} employee={employee}><span className="art-id">DM / {employee.number}</span><span className="art-category">{category.name}</span><span className="card-arrow"><ArrowUpRight size={22} /></span></EmployeeImage>
    <Link to={`/employee/${employee.id}`} className="employee-copy" aria-label={`查看${employee.title}详情`}><p className="employee-en">{employee.english}</p><h3>{employee.title}</h3><p className="employee-summary">{employee.summary}</p><div className="tags">{employee.tags.map(tag => <span key={tag}>{tag}</span>)}</div></Link>
  </article>;
}
