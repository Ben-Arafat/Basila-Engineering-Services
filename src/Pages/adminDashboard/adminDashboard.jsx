import StatCard from "../../Components/adminDashboard/statcard";
import useAdminStats from "../../Hooks/useAdminStats";


import {
  FiCalendar,
  FiMail,
  FiUsers,
  FiTool,
} from "react-icons/fi";

const AdminDashboard = () => {

  const { stats, loading, error } = useAdminStats();

    if (error) {
      return (
        <div className="p-6 md:p-8">
          <div className="rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </div>
        </div>
      );
    }
  return (
    <div className="p-6 md:p-8">

      {/* Page Header */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Overview
        </h1>

        <p className="mt-2 text-slate-500">
          Here's what's happening with your business.
        </p>
      </div>


      {/* Statistics */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <StatCard
          title="Bookings"
          value={loading ? "..." : stats.bookings}
          icon={<FiCalendar size={28} />}
          color="bg-yellow-500"
        />

        <StatCard
          title="Messages"
          value={loading ? "..." : stats.messages}
          icon={<FiMail size={28} />}
          color="bg-blue-500"
        />

        <StatCard
          title="Customers"
          value={loading ? "..." : stats.customers}
          icon={<FiUsers size={28} />}
          color="bg-green-500"
        />

        <StatCard
          title="Pending Jobs"
          value={loading ? "..." : stats.pendingJobs}
          icon={<FiTool size={28} />}
          color="bg-red-500"
        />

      </div>


      {/* Recent Activity */}

      <div className="mt-10">

        <h2 className="text-xl font-bold text-slate-900">
          Recent Activity
        </h2>

        <div className="mt-4 bg-white rounded-2xl p-6 shadow-sm">

          <p className="text-slate-500">
            Recent bookings and messages will appear here.
          </p>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;