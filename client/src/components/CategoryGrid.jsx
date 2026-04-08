import ProductCard from "./ProductCard";

export default function CategoryGrid({ products }) {
  const hasProducts = products?.length > 0;
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 justify-items-center p-16 gap-16 ${
        !hasProducts ? "flex-grow" : ""
      }`}
    >
      {products?.length > 0 ? (
        products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        <section role="status" aria-live="polite" className="w-full">
          <p className="text-center text-gray-500 text-lg">
            Nu există produse disponibile.
          </p>
        </section>
      )}
    </div>
  );
}
