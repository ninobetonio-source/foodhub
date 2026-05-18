export default function Textarea(props) {
  return <textarea {...props} className={`w-full rounded-2xl border border-gray-800 bg-gray-900/70 px-4 py-3 text-white outline-none transition-all placeholder:text-gray-500 focus:border-orange-400 ${props.className ?? ''}`} />;
}