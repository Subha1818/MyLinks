export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="font-heading font-extrabold text-3xl text-ink">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-ink/70 font-medium text-base">
          {description}
        </p>
      )}
    </div>
  );
}
