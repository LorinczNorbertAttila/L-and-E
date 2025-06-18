import React, { useState, useMemo, useEffect } from "react";
import Header from "../src/components/Header";
import { format, subMonths, isAfter } from "date-fns";
import { ro } from "date-fns/locale";
import { Collapse, IconButton } from "@material-tailwind/react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

// Filter options for the orders
const FILTERS = {
  THREE_MONTHS: "3months",
  SIX_MONTHS: "6months",
  ALL: "all",
};

//Order statuses
const STATUS_OPTIONS = [
  "Procesare",
  "În curs de livrare",
  "Expediată",
  "Finalizată",
  "Anulată",
];

//Order card
function OrderCard({ order, expanded, toggleExpand }) {
  const [status, setStatus] = useState(order.status || "");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setStatus(order.status || "");
  }, [order.status]);

  const handleSaveStatus = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${order.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );
      const result = await res.json();
      if (result.success) {
        setSuccessMsg("Status actualizat cu succes!");
        setTimeout(() => setSuccessMsg(""), 2000);
      }
    } catch (err) {
      console.error("Eroare la actualizarea statusului:", err);
    }
    setSaving(false);
  };
  // Format the order date for display
  const formattedDate = useMemo(() => {
    return format(new Date(order.createdAt), "dd MMM yyyy HH:mm", {
      locale: ro,
    });
  }, [order.createdAt]);

  // User details
  const user = order.user || {};

  return (
    <div className="bg-white/90 shadow-md rounded-xl text-gray-700 transition-all duration-300">
      {/* Order header with clickable area to expand/collapse details */}
      <div
        role="button"
        tabIndex={0}
        className="flex justify-between items-center px-4 py-3 cursor-pointer"
        onClick={() => toggleExpand(order.id)}
        onKeyDown={(e) => e.key === "Enter" && toggleExpand(order.id)}
      >
        <div>
          <h3 className="flex flex-col md:flex-row md:gap-1 font-semibold">
            <span>Comandă:</span>
            <span>{formattedDate}</span>
          </h3>
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-sm font-medium text-gray-700">
              Status comandă:
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2 pr-10">
              <select
                value={status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveStatus}
                  disabled={saving}
                  className="bg-teal-600 text-white p-2 rounded hover:bg-teal-700 disabled:opacity-50"
                  title="Salvează status"
                >
                  <Check className="w-4 h-4" />
                </button>
                {successMsg && (
                  <span className="text-green-600 text-xs">{successMsg}</span>
                )}
              </div>
            </div>
          </div>
          {/* User name and email always visible */}
          <div className="text-xs text-gray-600 mt-1">
            <span className="font-semibold">{user.name}</span>
            {" | "}
            <span>{user.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-teal-800 font-bold">{order.total} RON</span>
          <IconButton
            aria-expanded={expanded === order.id}
            size="sm"
            variant="text"
            color="teal"
            ripple={false}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(order.id);
            }}
          >
            {expanded === order.id ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </IconButton>
        </div>
      </div>
      {/* Collapsible section for order items and user details */}
      <Collapse open={expanded === order.id}>
        <div className="px-4 pb-4 space-y-4">
          {/* User details */}
          <div className="bg-gray-50 rounded-md p-3 mb-2">
            <div className="font-semibold mb-1">Datele clientului</div>
            <div className="text-sm">
              <div>
                <span className="font-medium">Nume:</span> {user.name}{" "}
                {user.lname}
              </div>
              <div>
                <span className="font-medium">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-medium">Telefon:</span> {user.tel || "-"}
              </div>
              <div>
                <span className="font-medium">Adresă:</span>{" "}
                {user.address || "-"}
              </div>
            </div>
          </div>
          {/* Order items */}
          {Array.isArray(order.items) &&
            order.items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex justify-between items-center gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 flex justify-center items-center bg-white border rounded-md">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="object-contain h-full rounded-md"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs text-center">
                        Imagine indisponibilă
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.product?.name}</span>
                    <span className="text-sm">Cantitate: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-semibold">{item.unitPrice} RON</span>
              </div>
            ))}
        </div>
      </Collapse>
    </div>
  );
}

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState(FILTERS.THREE_MONTHS); // "3months", "6months", "all"
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  // Fetch all orders from /api/orders
  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/orders?page=${currentPage}&limit=10&filter=${filter}`
        );
        const data = await res.json();
        if (data.success) {
          setOrders(data.data);
          setTotalPages(data.pagination.totalPages);
        } else {
          setOrders([]);
          setError("Eroare la încărcarea comenzilor.");
        }
      } catch (err) {
        setOrders([]);
        setError("Server error: ", err);
      }
      setLoading(false);
    }
    fetchOrders();
  }, [filter, currentPage]);

  // Handle expand/collapse of order cards
  const toggleExpand = (orderId) => {
    setExpanded((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <>
      {error && <div className="text-center text-red-500">{error}</div>}
      <header className="p-4" />
      <div className="pb-4">
        <Header />
      </div>
      <div className="p-4 md:px-20">
        <div className="flex flex-wrap gap-2 md:gap-10">
          <h2 className="text-white text-2xl font-bold mb-4">
            Toate comenzile
          </h2>

          <div className="mb-6 w-full md:w-64">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1); // back to the first page of orders
              }}
              className="bg-white text-gray-800 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={FILTERS.THREE_MONTHS}>Ultimele 3 luni</option>
              <option value={FILTERS.SIX_MONTHS}>Ultimele 6 luni</option>
              <option value={FILTERS.ALL}>Toate comenzile</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500">Se încarcă...</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500">Nu există comenzi.</div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                expanded={expanded}
                toggleExpand={toggleExpand}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-center mt-6 gap-2 flex-wrap">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            disabled={page === currentPage}
            className={`px-4 py-2 rounded-md border text-sm ${
              currentPage === page
                ? "bg-teal-600 text-white cursor-default"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}
      </div>
    </>
  );
}
