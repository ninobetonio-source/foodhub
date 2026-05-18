import Button from '../components/Button';
import Input from '../components/Input';
import Textarea from '../components/Textarea';

export default function Contact() {
  return (
    <div className="section-shell py-12">
      <div className="glass-card grid gap-6 p-6 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-black">Contact FoodHub</h1>
          <p className="mt-3 text-gray-400">For partnerships, support, and operational onboarding.</p>
        </div>
        <form className="grid gap-4">
          <Input placeholder="Full name" />
          <Input placeholder="Email" type="email" />
          <Textarea placeholder="Message" rows="5" />
          <Button type="submit">Send Message</Button>
        </form>
      </div>
    </div>
  );
}