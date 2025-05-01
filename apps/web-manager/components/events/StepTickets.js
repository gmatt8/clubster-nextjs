// apps/web-manager/components/events/StepDate.js


export default function StepTickets({ ticketCategories, setTicketCategories }) {
    function handleAddCategory() {
      setTicketCategories([...ticketCategories, { name: "", price: 0, available_tickets: 0 }]);
    }
  
    function handleRemoveCategory(index) {
      const updated = [...ticketCategories];
      updated.splice(index, 1);
      setTicketCategories(updated);
    }
  
    function handleChange(index, field, value) {
      const updated = [...ticketCategories];
      updated[index][field] = value;
      setTicketCategories(updated);
    }
  
    return (
      <div className="space-y-6">
        {ticketCategories.map((cat, i) => (
          <div key={i} className="border p-4 rounded space-y-2">
            <div>
              <label className="block font-medium">Nome Categoria</label>
              <input
                type="text"
                value={cat.name}
                onChange={(e) => handleChange(i, "name", e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium">Prezzo</label>
              <input
                type="number"
                value={cat.price}
                onChange={(e) => handleChange(i, "price", e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-medium">Numero Biglietti</label>
              <input
                type="number"
                value={cat.available_tickets}
                onChange={(e) => handleChange(i, "available_tickets", e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            {ticketCategories.length > 1 && (
              <button
                onClick={() => handleRemoveCategory(i)}
                className="text-sm text-red-600 hover:underline"
              >
                Rimuovi categoria
              </button>
            )}
          </div>
        ))}
        <button
          onClick={handleAddCategory}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          + Aggiungi categoria
        </button>
      </div>
    );
  }
  