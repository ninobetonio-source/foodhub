import SectionHeading from '../components/SectionHeading';
import { categories } from '../utils/mockData';

export default function Categories() {
  return (
    <div className="section-shell py-12">
      <SectionHeading eyebrow="Categories" title="Premium category browsing for fast discovery." />
      <div className="grid gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <div key={category.id} className="glass-card overflow-hidden">
            <img src={category.image_url} alt={category.name} className="h-56 w-full object-cover" />
            <div className="p-5">
              <h3 className="text-2xl font-black">{category.name}</h3>
              <p className="mt-2 text-sm text-gray-400">{category.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}