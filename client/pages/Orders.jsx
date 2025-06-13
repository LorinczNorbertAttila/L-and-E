import React, { useState, useMemo } from "react";
import Header from "../src/components/Header";
import { useAuth } from "../src/contexts/AuthContext";
import { format, subMonths, isAfter } from "date-fns";
import { ro } from "date-fns/locale";
import { Collapse, IconButton } from "@material-tailwind/react";
import { ChevronDown, ChevronUp } from "lucide-react";

// Filter options for the orders
const FILTERS = {
  THREE_MONTHS: "3months",
  SIX_MONTHS: "6months",
  ALL: "all",
};

//Order card
function OrderCard({ order, expanded, toggleExpand }) {
  // Format the order date for display
  const formattedDate = useMemo(() => {
    return format(new Date(order.createdAt), "dd MMM yyyy HH:mm", {
      locale: ro,
    });
  }, [order.createdAt]);

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
            <span>Comanda:</span>
            <span>{formattedDate}</span>
          </h3>
          <span className="text-sm">
            Status: {order.status || "Necunoscut"}
          </span>
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
      {/* Collapsible section for order items */}
      <Collapse open={expanded === order.id}>
        <div className="px-4 pb-4 space-y-4">
          {Array.isArray(order.items) &&
            order.items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="flex justify-between items-center gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 flex justify-center items-center bg-white border rounded-md">
                    {item.product.imageUrl ? (
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

export default function Orders() {
  const { orders = [] } = useAuth();
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState(FILTERS.THREE_MONTHS); // "3months", "6months", "all"

  // Filter and sort orders based on selected filter
  const getFilteredOrders = () => {
    let filtered = [...orders];

    if (filter === FILTERS.THREE_MONTHS) {
      const threeMonthsAgo = subMonths(new Date(), 3);
      filtered = filtered.filter((order) =>
        isAfter(new Date(order.createdAt), threeMonthsAgo)
      );
    } else if (filter === FILTERS.SIX_MONTHS) {
      const sixMonthsAgo = subMonths(new Date(), 6);
      filtered = filtered.filter((order) =>
        isAfter(new Date(order.createdAt), sixMonthsAgo)
      );
    }
    // Sort orders by date descending
    return filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };
  const sortedFilteredOrders = useMemo(getFilteredOrders, [orders, filter]);

  // Handle expand/collapse of order cards
  const toggleExpand = (orderId) => {
    setExpanded((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <>
      <header className="p-4" />
      <div className="pb-4">
        <Header />
      </div>
      <div className="p-4 md:px-20">
        <div className="flex flex-wrap gap-2 md:gap-10">
          <h2 className="text-white text-2xl font-bold mb-4">Comenzile mele</h2>

          <div className="mb-6 w-full md:w-64">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white text-gray-800 border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={FILTERS.THREE_MONTHS}>Ultimele 3 luni</option>
              <option value={FILTERS.SIX_MONTHS}>Ultimele 6 luni</option>
              <option value={FILTERS.ALL}>Toate comenzile</option>
            </select>
          </div>
        </div>

        {sortedFilteredOrders.length === 0 ? (
          <div className="text-center text-gray-500">
            Nu ai comenzi plasate.
          </div>
        ) : (
          <div className="space-y-6">
            {sortedFilteredOrders.map((order) => (
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
    </>
  );
}
