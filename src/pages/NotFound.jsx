import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="section-shell flex min-h-[70vh] items-center justify-center py-12 text-center">
      <div>
        <p className="text-7xl font-black text-orange-400">404</p>
        <p className="mt-4 text-2xl font-extrabold">Page not found</p>
        <Link to="/"><Button className="mt-6">Return Home</Button></Link>
      </div>
    </div>
  );
}