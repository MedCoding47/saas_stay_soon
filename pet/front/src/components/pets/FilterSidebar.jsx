import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

const speciesOptions = [
  { value: '', label: 'All species' },
  { value: 'Dog', label: 'Dog 🐕' },
  { value: 'Cat', label: 'Cat 🐈' },
  { value: 'Rabbit', label: 'Rabbit 🐰' },
  { value: 'Bird', label: 'Bird 🦜' },
  { value: 'Other', label: 'Other' },
];

const ageOptions = [
  { value: '', label: 'All ages' },
  { value: 'baby', label: 'Baby (0-1 yr)' },
  { value: 'young', label: 'Young (1-3 yr)' },
  { value: 'adult', label: 'Adult (3-7 yr)' },
  { value: 'senior', label: 'Senior (7+ yr)' },
];

const sizeOptions = [
  { value: '', label: 'All sizes' },
  { value: 'Small', label: 'Small' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Large', label: 'Large' },
];

const genderOptions = [
  { value: '', label: 'All' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'Available', label: 'Available' },
  { value: 'UnderReview', label: 'Under Review' },
];

export default function FilterSidebar({ filters, onFilterChange, onReset, mobileOpen, onMobileClose }) {
  const handleChange = (key, value) => {
    onFilterChange?.({ ...filters, [key]: value });
  };

  const content = (
    <div className="space-y-6">
      {/* Species */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Species</h4>
        <div className="space-y-2">
          {speciesOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-coral transition-colors">
              <input
                type="radio"
                name="species"
                checked={filters.species === opt.value}
                onChange={() => handleChange('species', opt.value)}
                className="accent-coral"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-warm-dark" />

      {/* Age */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Age</h4>
        <div className="space-y-2">
          {ageOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-coral transition-colors">
              <input
                type="radio"
                name="age"
                checked={filters.age === opt.value}
                onChange={() => handleChange('age', opt.value)}
                className="accent-coral"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-warm-dark" />

      {/* Size */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Size</h4>
        <div className="space-y-2">
          {sizeOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-coral transition-colors">
              <input
                type="radio"
                name="size"
                checked={filters.size === opt.value}
                onChange={() => handleChange('size', opt.value)}
                className="accent-coral"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-warm-dark" />

      {/* Gender */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Gender</h4>
        <div className="space-y-2">
          {genderOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-coral transition-colors">
              <input
                type="radio"
                name="gender"
                checked={filters.gender === opt.value}
                onChange={() => handleChange('gender', opt.value)}
                className="accent-coral"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <hr className="border-warm-dark" />

      {/* Status */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Status</h4>
        <div className="space-y-2">
          {statusOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-coral transition-colors">
              <input
                type="radio"
                name="status"
                checked={filters.status === opt.value}
                onChange={() => handleChange('status', opt.value)}
                className="accent-coral"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-2">
        <Button variant="primary" className="w-full !rounded-pill" onClick={() => {}}>
          Apply filters
        </Button>
        <Button variant="outline" className="w-full !rounded-pill !border-coral/50 !text-coral" onClick={onReset}>
          Reset filters
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block sticky top-24">
        {content}
      </div>

      {/* Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden bg-white rounded-2xl shadow-card p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Filters</h3>
              <button onClick={onMobileClose} className="text-muted hover:text-dark text-lg">&times;</button>
            </div>
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
