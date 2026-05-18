export default function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-[#222] pb-2">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      {action ? <div>{action}</div> : null}
    </div>
  );
}