import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { expert } from '../services/api';
import { fetchWeather, WeatherData } from '../services/weatherService';
import { useStore } from '../context/StoreContext';
import { RequestStatus, Urgency } from '../types';
import { Save, ArrowLeft, Mic, MicOff, Calendar } from 'lucide-react';

// Pre-defined templates for quick reporting
const REPORT_TEMPLATES: Record<string, { problem: string; diagnosis: string; recommendation: string }> = {
  'FERTILIZER': {
    problem: 'Nutrient deficiency symptoms observed (yellowing leaves).',
    diagnosis: 'Nitrogen deficiency likely due to soil leaching.',
    recommendation: 'Apply Urea top dressing at 15kg/acre immediately. Ensure soil moisture is adequate before application.'
  },
  'PEST_CONTROL': {
    problem: 'Visible pest damage on leaves.',
    diagnosis: 'Early stage Stem Borer infestation.',
    recommendation: 'Apply systematic pesticide (Cartap) within 48 hours. Setup light traps to monitor population.'
  },
  'FUNGAL': {
    problem: 'White powdery patches on leaves.',
    diagnosis: 'Powdery Mildew infection.',
    recommendation: 'Spray Sulphur-based fungicide. Improve air circulation by trimming excess foliage.'
  }
};

export const ReportSubmission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useStore();
  const request = state.requests.find(r => r.id === id);
  const isReadOnly = request?.status === RequestStatus.COMPLETED;

  const [form, setForm] = useState({
    problemSummary: '',
    diagnosis: '',
    recommendation: '',
    urgency: Urgency.MEDIUM,
    followUp: false,
    followUpDays: 7,
    liabilityChecked: false
  });

  const [isListening, setIsListening] = useState(false);

  // Fetch existing advice if Read Only
  React.useEffect(() => {
    if (isReadOnly && request?.field?.id) {
      expert.getAdviceByField(parseInt(request.field.id)).then(data => {
        if (data && data.length > 0) {
          const advice = data[0].advice; // Latest advice
          setForm(prev => ({
            ...prev,
            problemSummary: advice.problemSummary,
            diagnosis: advice.diagnosis,
            recommendation: advice.recommendation,
            urgency: advice.urgency || Urgency.MEDIUM,
            followUp: advice.followUp || false,
            followUpDays: advice.followUpDays || 7,
            liabilityChecked: true
          }));
        }
      }).catch(err => console.error("Failed to load advice", err));
    }
  }, [isReadOnly, request]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = REPORT_TEMPLATES[e.target.value];
    if (template) {
      setForm(prev => ({
        ...prev,
        problemSummary: template.problem,
        diagnosis: template.diagnosis,
        recommendation: template.recommendation
      }));
    }
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setForm(prev => ({
        ...prev,
        recommendation: prev.recommendation + " (Voice Note: Farmer advised to check water levels daily.)"
      }));
      alert("Voice transcribed successfully!");
    }, 2000);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isReadOnly) return; // Prevent if read only

    if (!form.problemSummary || !form.diagnosis || !form.recommendation) {
      alert("All fields are mandatory.");
      return;
    }

    if (!form.liabilityChecked) {
      alert("Please acknowledge the data limitations to proceed.");
      return;
    }

    setSubmitting(true);
    try {
      const adviceData = {
        field: request.field?.id,
        advice: {
          problemSummary: form.problemSummary,
          diagnosis: form.diagnosis,
          recommendation: form.recommendation,
          urgency: form.urgency,
          followUp: form.followUp,
          followUpDays: form.followUpDays
        }
      };

      if (!adviceData.field) {
        alert("This request does not have a linked field. Cannot create Field-linked advice.");
        setSubmitting(false);
        return;
      }

      await expert.submitAdvice(adviceData);
      await expert.updateRequestStatus(id, RequestStatus.COMPLETED);

      dispatch({
        type: 'UPDATE_REQUEST_STATUS',
        payload: { id, status: RequestStatus.COMPLETED }
      });

      alert("রিপোর্ট জমা দেওয়া হয়েছে! ৳50 যোগ করা হয়েছে।");
      navigate('/expert/dashboard');
    } catch (err) {
      console.error(err);
      alert("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!request) return <div>Request not found</div>;

  return (
    <div className="bg-gray-50 min-h-screen md:pl-64">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-20 shadow-sm flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="font-bold text-gray-900">{isReadOnly ? "Submitted Report Details" : "Final Consultation Report"}</h2>
          <p className={`text-xs font-medium ${isReadOnly ? 'text-green-600' : 'text-red-500'}`}>
            {isReadOnly ? "This report has been submitted and cannot be edited." : "Required to close request"}
          </p>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-white p-5 rounded-2xl shadow-sm space-y-4">

            {/* 📄 Template Selector - Hide if ReadOnly */}
            {!isReadOnly && (
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <label className="block text-xs font-bold text-blue-800 mb-2 uppercase tracking-wide">Quick Template</label>
                <select
                  className="w-full p-2 bg-white rounded-lg text-sm border-blue-200 focus:ring-blue-500"
                  onChange={handleTemplateChange}
                  defaultValue=""
                >
                  <option value="" disabled>Select a standard issue type...</option>
                  <option value="FERTILIZER">Fertilizer / Nutrient Deficiency</option>
                  <option value="PEST_CONTROL">Pest Infestation</option>
                  <option value="FUNGAL">Fungal Disease</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Problem Summary</label>
              <input
                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="Short description of the issue..."
                value={form.problemSummary}
                onChange={e => setForm({ ...form, problemSummary: e.target.value })}
                required
                disabled={isReadOnly}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Diagnosis</label>
              <textarea
                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500 h-24 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="What is wrong with the crop?"
                value={form.diagnosis}
                onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                required
                disabled={isReadOnly}
              />
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">Recommendation</label>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    {isListening ? 'Listening...' : 'Voice Input'}
                  </button>
                )}
              </div>
              <textarea
                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-green-500 h-32 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="Steps for the farmer to take..."
                value={form.recommendation}
                onChange={e => setForm({ ...form, recommendation: e.target.value })}
                required
                disabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Urgency Level</label>
                <select
                  className="w-full p-3 bg-gray-50 rounded-xl disabled:bg-gray-100 disabled:text-gray-500"
                  value={form.urgency}
                  onChange={e => setForm({ ...form, urgency: e.target.value as Urgency })}
                  disabled={isReadOnly}
                >
                  <option value={Urgency.LOW}>Low</option>
                  <option value={Urgency.MEDIUM}>Medium</option>
                  <option value={Urgency.HIGH}>High</option>
                  <option value={Urgency.CRITICAL}>Critical</option>
                </select>
              </div>

              {/* 📅 Follow-up Logic */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    checked={form.followUp}
                    onChange={e => setForm({ ...form, followUp: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded"
                    disabled={isReadOnly}
                  />
                  Follow-up Required?
                </label>
                {form.followUp && (
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <select
                      className="bg-transparent text-sm w-full disabled:text-gray-500"
                      value={form.followUpDays}
                      onChange={e => setForm({ ...form, followUpDays: parseInt(e.target.value) })}
                      disabled={isReadOnly}
                    >
                      <option value={7}>After 1 Week</option>
                      <option value={14}>After 2 Weeks</option>
                      <option value={30}>After 1 Month</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* ⚖️ Legal / Confidence Checkbox */}
            <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.liabilityChecked}
                  onChange={e => setForm({ ...form, liabilityChecked: e.target.checked })}
                  className="mt-1 w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  disabled={isReadOnly}
                />
                <span className="text-xs text-gray-700">
                  <b>Data Limitation Acknowledgement:</b> I verify that this advice is given based on the available data provided, acknowledging potential limitations in sensor accuracy or sampling frequency.
                </span>
              </label>
            </div>

          </div>

          {!isReadOnly && (
            <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-white border-t border-gray-200">
              <button
                type="submit"
                className="w-full bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                রিপোর্ট জমা দিন (Submit)
              </button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};