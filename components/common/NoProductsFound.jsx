export default function NoProductsFound({ height="100vh" , message = "No products found" }) {
  return (
      <div className="flex items-center justify-center"
       style={{ minHeight: height }}>
      <p className="text-2xl text-gray-500">{message}</p>
    </div>
  );
}