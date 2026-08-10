import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { getAuthInstance, getDbInstance } from "../Firebase/firebase";



const Booking = () => {


  const [service, setService] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe = null;

    const initializeAuth = async () => {
      const auth = await getAuthInstance();
      const { onAuthStateChanged } = await import("firebase/auth");
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setAuthReady(true);
      });
    };

    initializeAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!navigator.onLine) {
      await Swal.fire({
        icon: "error",
        title: "No Internet Connection",
        text: "Please check your internet connection and try again.",
        confirmButtonColor: "#DC2626",
      });

      return;
    }

    // Validation form
    if (!service || !description || !location) {
      await Swal.fire({
        icon: "warning",
        title: "Incomplete Form",
        text: "Please fill in all required fields.",
        confirmButtonColor: "#EAB308",
        });
      return;
    }

    if (!authReady) {
      await Swal.fire({
        icon: "info",
        title: "Please Wait",
        text: "Checking your sign-in status...",
        confirmButtonColor: "#3B82F6",
        });
      return;
    }

    if (!user) {
      await Swal.fire({
        icon: "info",
        title: "Login Required",
        text: "Please log in before booking a service.",
        confirmButtonColor: "#3B82F6",
        });
      return;
    }

    try {
      setLoading(true);
      const db = await getDbInstance();
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        userEmail: user.email,
        service: service,
        location: location,
        description: description,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      const result = await Swal.fire({
        icon: "success",
        title: "Request Submitted!",
        text: "Your service request has been submitted successfully. We'll contact you shortly.",
        confirmButtonColor: "#EAB308",
        confirmButtonText: "Awesome!",
      });

      if (result.isConfirmed) {
        navigate("/dashboard");
      }

      // Clear the form
      setService("");
      setLocation("");
      setDescription("");
      } catch (error) {
      console.error("Booking Error:", error);

      let message =
        "We couldn't submit your booking. Please try again.";

      if (error.code === "permission-denied") {
        message =
          "You don't have permission to submit this booking. Please log in again and try.";
      } else if (
        error.code === "unavailable" ||
        error.code === "network-request-failed"
      ) {
        message =
          "Unable to connect to the server. Please check your internet connection and try again.";
      }

      await Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: message,
        confirmButtonColor: "#DC2626",
      });
    } finally {
      setLoading(false);
    }
  };


  return (

    <div className="min-h-screen bg-slate-100 p-5 md:p-10">


      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow p-6 md:p-10">


        <h1 className="text-3xl font-bold text-gray-900">
          Book a Service
        </h1>


        <p className="text-gray-500 mt-2">
          Tell us what service you need and our team will get back to you.
        </p>



        <form
          onSubmit={handleBooking}
          className="mt-8 space-y-5"
        >


          {/* Service */}

          <div>

            <label className="font-semibold">
              Select Service
            </label>


            <select
              value={service}
              onChange={(e)=>setService(e.target.value)}
              className="w-full mt-2 border rounded-xl px-4 py-3"
            >

              <option value="">
                Choose a service
              </option>

              <option>
                Electrical Installation
              </option>

               <option>
                HVAC & Mechanical Services
              </option>

              <option>
                Solar Solutions
              </option>

              <option>
                Hybrid Energy (Solar + Generator)
              </option>

              <option>
                Consultation
              </option>

               <option>
                Smart Home Automation
              </option>

               <option>
                CCTA, Access Control & Security Systems
              </option>

               <option>
                Networking & Communication Services
              </option>


            </select>

          </div>





          {/* Location */}

          <div>

            <label className="font-semibold">
              Location
            </label>


            <input

              type="text"

              placeholder="Enter your location"

              value={location}

              onChange={(e)=>setLocation(e.target.value)}

              className="w-full mt-2 border rounded-xl px-4 py-3"

            />


          </div>





          {/* Description */}

          <div>

            <label className="font-semibold">
              Describe your request
            </label>


            <textarea

              rows="5"

              placeholder="Explain what you need help with..."

              value={description}

              onChange={(e)=>setDescription(e.target.value)}

              className="w-full mt-2 border rounded-xl px-4 py-3"

            />


          </div>





          <button
            type="submit"
            disabled={loading || !authReady || !user}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>




        </form>


      </div>


    </div>

  );

};


export default Booking;