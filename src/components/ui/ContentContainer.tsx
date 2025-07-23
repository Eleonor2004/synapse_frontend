interface ContentContainerProps {
  children: React.ReactNode;
}

export const ContentContainer = ({ children }: ContentContainerProps) => {
  return (
    <div className="container mx-auto px-4 md:px-6 py-16">
      <article className="prose dark:prose-invert max-w-4xl mx-auto">
        {children}
      </article>
    </div>
  );
};