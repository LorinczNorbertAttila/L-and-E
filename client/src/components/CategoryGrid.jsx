import ProductCard from "./ProductCard";

export default function CategoryGrid({ products }) {
  const hasProducts = products?.length > 0;
  return (
    <div
      className={`flex flex-wrap justify-center items-center p-10 gap-16 ${
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
