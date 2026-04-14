import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import NotificationBanner from '../../components/NotificationBanner';

export default function AdminAppSettings() {
  const [appName, setAppName] = useState('MBT');
  const [tagline, setTagline] = useState('Blood test analysis made simple.');
  const [supportEmail, setSupportEmail] = useState('support@mbt.com');
  const [showUsageWarning, setShowUsageWarning] = useState(true);
  const [usageWarningText, setUsageWarningText] = useState('You are running low on free analyses.');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('We are currently performing maintenance. We will be back soon!');
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState('New feature: Export your reports to PDF!');
  const [proPrice, setProPrice] = useState(5);
  const [showMaintenancePreview, setShowMaintenancePreview] = useState(true);
  const [showAnnouncementPreview, setShowAnnouncementPreview] = useState(true);

  useEffect(() => {
    localStorage.setItem('maintenanceMode', JSON.stringify(maintenanceMode));
    localStorage.setItem('maintenanceMessage', maintenanceMessage);
    localStorage.setItem('showAnnouncement', JSON.stringify(showAnnouncement));
    localStorage.setItem('announcementText', announcementText);
  }, [maintenanceMode, maintenanceMessage, showAnnouncement, announcementText]);

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 md:mb-8">App Settings</h1>

      {/* General */}
      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">General</h2>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 shadow-inner focus:bg-white focus:shadow-md focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="App Name" />
          <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 shadow-inner focus:bg-white focus:shadow-md focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="Tagline" />
          <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 shadow-inner focus:bg-white focus:shadow-md focus:ring-2 focus:ring-emerald-500 outline-none transition" placeholder="Support Email" />
        </div>
        <button className="flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition"><Save size={18} /> Save General Settings</button>
      </section>

      {/* Toggles & Banners */}
      <div className="grid grid-cols-1 gap-8">
        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Free Limit Banner</h2>
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="checkbox" checked={showUsageWarning} onChange={(e) => setShowUsageWarning(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition duration-150 ease-in-out" />
            <span className="text-slate-700">Show usage warning to free users</span>
          </label>
          <input type="text" value={usageWarningText} onChange={(e) => setUsageWarningText(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 shadow-inner focus:bg-white focus:shadow-md focus:ring-2 focus:ring-emerald-500 outline-none transition" />
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Maintenance Mode</h2>
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition duration-150 ease-in-out" />
            <span className="text-slate-700">Enable Maintenance Mode</span>
          </label>
          <input type="text" value={maintenanceMessage} onChange={(e) => setMaintenanceMessage(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 shadow-inner focus:bg-white focus:shadow-md focus:ring-2 focus:ring-emerald-500 outline-none transition" />
          {showMaintenancePreview && (
            <div className="mt-4 border border-slate-200 rounded-lg p-2 bg-slate-50">
              <p className="text-xs text-slate-500 mb-2 font-semibold uppercase">Preview</p>
              <NotificationBanner type="maintenance" message={maintenanceMessage} onClose={() => setShowMaintenancePreview(false)} />
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Announcement Banner</h2>
          <label className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="checkbox" checked={showAnnouncement} onChange={(e) => setShowAnnouncement(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition duration-150 ease-in-out" />
            <span className="text-slate-700">Show announcement banner</span>
          </label>
          <input type="text" value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} className="w-full border border-slate-200 rounded-lg p-3 bg-slate-50 shadow-inner focus:bg-white focus:shadow-md focus:ring-2 focus:ring-emerald-500 outline-none transition" />
          {showAnnouncementPreview && (
            <div className="mt-4 border border-slate-200 rounded-lg p-2 bg-slate-50">
              <p className="text-xs text-slate-500 mb-2 font-semibold uppercase">Preview</p>
              <NotificationBanner type="announcement" message={announcementText} onClose={() => setShowAnnouncementPreview(false)} />
            </div>
          )}
        </section>

        <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Pro Plan Price</h2>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">$</span>
            <input type="number" value={proPrice} onChange={(e) => setProPrice(Number(e.target.value))} className="w-24 border border-slate-200 rounded-lg p-3 bg-slate-50 shadow-inner focus:bg-white focus:shadow-md focus:ring-2 focus:ring-emerald-500 outline-none transition" />
          </div>
        </section>
      </div>
    </div>
  );
}
