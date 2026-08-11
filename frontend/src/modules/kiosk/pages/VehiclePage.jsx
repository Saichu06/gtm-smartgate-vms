/**
 * VehiclePage — Step 5 (or Step 4 when Laptop=NO).
 * Vehicle Type + Vehicle Number — both MANDATORY.
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Car } from 'lucide-react';
import KioskHeader from '../components/Common/KioskHeader';
import { useVisitor } from '../context/VisitorContext';
import '../styles/kiosk.css';

const VEHICLE_TYPES = ['Car', 'Motorcycle', 'Van', 'Truck', 'Auto Rickshaw', 'Bicycle', 'Other'];

const VehiclePage = () => {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const { org, visitor, updateVisitor } = useVisitor();
  const primary = org?.primaryColor || '#1565C0';

  const isLaptop = visitor.laptop === 'YES';
  const stepNumber = isLaptop ? 5 : 4;

  const [vehicleType, setVehicleType] = useState(visitor.vehicleType || 'Car');
  const [vehicleNo, setVehicleNo]     = useState(visitor.vehicleNumber || '');
  const [errors, setErrors]           = useState({});

  const validate = () => {
    const e = {};
    if (!vehicleType.trim()) e.vehicleType = 'Vehicle type is required';
    if (!vehicleNo.trim())   e.vehicleNo   = 'Vehicle number is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    updateVisitor({ vehicleType: vehicleType.trim(), vehicleNumber: vehicleNo.trim() });
    navigate(`/kiosk/${orgId}/gate-pass`);
  };

  const handleBack = () => {
    if (isLaptop) {
      navigate(`/kiosk/${orgId}/luggage`);
    } else {
      navigate(`/kiosk/${orgId}/identity`);
    }
  };

  return (
    <div className="kiosk-shell" style={{ '--kiosk-primary': primary }}>
      <div className="kiosk-page">
        <div className="kiosk-panel">
          <KioskHeader currentStep={stepNumber} />

          <div className="kiosk-section-title">
            <Car size={18} style={{ color: primary }} />
            <span>Vehicle Details</span>
          </div>
          <p className="kiosk-section-sub">Vehicle information is mandatory for security registration.</p>

          <div className="kiosk-form-stack">
            {/* Vehicle Type */}
            <div className="kiosk-field">
              <label className="kiosk-label">Vehicle Type *</label>
              <div className={`kiosk-input-wrap ${errors.vehicleType ? 'error' : ''}`}>
                <select
                  className="kiosk-input"
                  value={vehicleType}
                  onChange={e => { setVehicleType(e.target.value); setErrors(p => ({ ...p, vehicleType: '' })); }}
                  style={{ cursor: 'pointer' }}
                >
                  {VEHICLE_TYPES.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              {errors.vehicleType && <span className="kiosk-field-error">{errors.vehicleType}</span>}
            </div>

            {/* Vehicle Number */}
            <div className="kiosk-field">
              <label className="kiosk-label">Vehicle Number *</label>
              <div className={`kiosk-input-wrap ${errors.vehicleNo ? 'error' : ''}`}>
                <input
                  type="text"
                  className="kiosk-input"
                  placeholder="e.g. TN 01 AB 1234"
                  value={vehicleNo}
                  onChange={e => { setVehicleNo(e.target.value.toUpperCase()); setErrors(p => ({ ...p, vehicleNo: '' })); }}
                  autoFocus
                />
              </div>
              {errors.vehicleNo && <span className="kiosk-field-error">{errors.vehicleNo}</span>}
            </div>
          </div>

          <div className="kiosk-action-row">
            <button className="kiosk-btn kiosk-btn-back" onClick={handleBack}>
              <ArrowLeft size={16} /> Back
            </button>
            <button className="kiosk-btn kiosk-btn-primary" onClick={handleNext}>
              Next <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehiclePage;
