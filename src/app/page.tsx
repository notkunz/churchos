import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold text-blue-600">ChurchOS</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-block bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full mb-6">
          Built for Nigerian Churches
        </div>
        <h2 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Run your church.
          <br />
          Not paperwork.
        </h2>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          ChurchOS helps pastors manage members, track attendance, record
          offerings, and know which members are going cold, all from one
          dashboard.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Start Free Trial
          </Link>
          <Link
            href="/login"
            className="text-gray-500 text-sm hover:text-gray-800"
          >
            Already have an account
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-12">
            Everything your church needs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Member Directory",
                desc: "Keep a full record of every member — name, phone, department, join date. Search and filter instantly.",
              },
              {
                title: "Attendance Tracking",
                desc: "Mark attendance every Sunday digitally. See who has been missing before you lose them.",
              },
              {
                title: "Follow-up List",
                desc: "Automatically see which members have not attended in 3+ weeks so you can reach out.",
              },
              {
                title: "Offering Records",
                desc: "Log tithes and offerings per service or per member. See monthly totals at a glance.",
              },
              {
                title: "Events",
                desc: "Create and manage church events. Past and upcoming events stay organised automatically.",
              },
              {
                title: "Monthly Reports",
                desc: "Get a full financial and attendance summary every month. Print it for your leadership meetings.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-xl p-6 border border-gray-100"
              >
                <h4 className="font-semibold text-gray-800 mb-2">{f.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Simple pricing
          </h3>
          <p className="text-gray-500 text-sm mb-12">
            No hidden fees. Cancel anytime.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              {
                name: "Basic",
                price: "₦10,000",
                period: "/month",
                desc: "For small churches up to 200 members",
                features: [
                  "Member directory",
                  "Attendance tracking",
                  "Follow-up list",
                  "Offering records",
                  "Monthly reports",
                ],
                cta: "Get Started",
                highlight: false,
              },
              {
                name: "Growth",
                price: "₦20,000",
                period: "/month",
                desc: "For growing churches up to 1,000 members",
                features: [
                  "Everything in Basic",
                  "Unlimited members",
                  "Multiple admins",
                  "Priority support",
                  "Data export",
                ],
                cta: "Get Started",
                highlight: true,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl p-6 border text-left ${plan.highlight ? "bg-blue-600 border-blue-600" : "bg-white border-gray-100"}`}
              >
                <h4
                  className={`font-semibold mb-1 ${plan.highlight ? "text-white" : "text-gray-800"}`}
                >
                  {plan.name}
                </h4>
                <p
                  className={`text-xs mb-4 ${plan.highlight ? "text-blue-200" : "text-gray-400"}`}
                >
                  {plan.desc}
                </p>
                <div className="flex items-end gap-1 mb-6">
                  <span
                    className={`text-3xl font-bold ${plan.highlight ? "text-white" : "text-gray-800"}`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm mb-1 ${plan.highlight ? "text-blue-200" : "text-gray.400"}`}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={`text-sm flex items-center gap-2 ${plan.highlight ? "text-blue-100" : "text-gray-500"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${plan.highlight ? "bg-blue-200" : "bg-blue-400"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-2 rounded-lg text-sm font-medium ${plan.highlight ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to organise your church?
          </h3>
          <p className="text-blue-200 text-sm mb-8">
            Join churches across Nigeria already using ChurchOS
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg text-sm font-medium hover:bg-blue-50"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <h1 className="text-sm font-bold text-blue-600">ChurchOS</h1>
          <p className="text-xs text-gray-400">Built in Lagos, Nigeria</p>
        </div>
      </footer>
    </div>
  );
}
