import React, { useEffect, useState } from "react";
import api from "../../config/api";

function AdminAdoptionList() {
  const [adoptions, setAdoptions] = useState([]);
  const [error, setError] = useState("");

  const fetchAdoptions = async () => {
    try {
      const response = await api.get('/adoptions?pageNumber=1&pageSize=50');
      setAdoptions(response.data.requests);
    } catch (err) {
      console.error("Erreur API :", err.response?.data || err.message);
      setError("Erreur lors de la récupération des demandes.");
    }
  };

  const handleStatusChange = async (id, status) => {
    const response = prompt("Entrez la réponse à envoyer au client :");
    if (response === null) return;

    try {
      await api.patch(`/adoptions/${id}/status`, {
        status,
        adminResponse: response
      });
      fetchAdoptions();
    } catch (err) {
      console.error("Erreur mise à jour :", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchAdoptions();
  }, []);

  return (
    <div className="admin-adoption-list">
      <h2>📋 Demandes d'adoption</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Animal</th>
            <th>Utilisateur</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Raison</th>
            <th>Status</th>
            <th>Réponse</th>
            <th>Action</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {adoptions.map((item) => (
            <tr key={item.id}>
              <td>{item.pet?.name || "N/A"}</td>
              <td>{item.user?.name || "Anonyme"}</td>
              <td>{item.contactEmail}</td>
              <td>{item.contactPhone}</td>
              <td>{item.adoptionReason}</td>
              <td>{item.status}</td>
              <td>{item.adminResponse || "—"}</td>
              <td>
              {item.status !== "rejected" && (
                <button
                  onClick={() => handleStatusChange(item.id, "approved")}
                  disabled={item.status === "approved"}
                >
                  ✅ Accepter
                </button>
                )}
                {/* Le bouton "Refuser" ne s'affiche pas si la demande est acceptée */}
                {item.status !== "approved" && (
                  <button
                    onClick={() => handleStatusChange(item.id, "rejected")}
                    disabled={item.status === "rejected"}
                  >
                    ❌ Refuser
                  </button>
                )}
              </td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminAdoptionList;
