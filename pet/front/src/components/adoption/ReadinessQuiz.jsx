import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';

const STEPS = [
  { key: 'welcome' },
  { key: 'lifestyle' },
  { key: 'home' },
  { key: 'experience' },
  { key: 'match' },
  { key: 'review' },
];

export default function ReadinessQuiz({ petId, petName, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const [answers, setAnswers] = useState({
    livingSituation: '',
    hoursAlone: '',
    activityLevel: '',
    housingType: '',
    outdoorSpace: '',
    rentOwn: '',
    hasChildren: '',
    childrenAges: '',
    hasOtherPets: '',
    otherPetsDetail: '',
    pastPetExperience: '',
    preferredSpecies: '',
    preferredAge: '',
    preferredSize: '',
    preferredEnergy: '',
    motivation: '',
  });

  const update = (field, value) => setAnswers(prev => ({ ...prev, [field]: value }));

  const totalSteps = STEPS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const canProceed = () => {
    if (step === 1) return answers.livingSituation && answers.hoursAlone && answers.activityLevel;
    if (step === 2) return answers.housingType && answers.outdoorSpace && answers.rentOwn;
    if (step === 3) return answers.pastPetExperience;
    if (step === 4) return answers.preferredSpecies && answers.preferredAge;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/adoptions/apply', {
        petId,
        applicationMessage: answers.motivation || null,
        livingSituation: answers.livingSituation,
        hoursAlone: answers.hoursAlone,
        activityLevel: answers.activityLevel,
        housingType: answers.housingType,
        outdoorSpace: answers.outdoorSpace,
        rentOwn: answers.rentOwn,
        hasChildren: answers.hasChildren,
        childrenAges: answers.childrenAges || null,
        hasOtherPets: answers.hasOtherPets || '',
        otherPetsDetail: answers.otherPetsDetail || null,
        pastPetExperience: answers.pastPetExperience,
        preferredSpecies: answers.preferredSpecies,
        preferredAge: answers.preferredAge,
        preferredSize: answers.preferredSize || null,
        preferredEnergy: answers.preferredEnergy || null,
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || t('adoptQuiz.submitError'));
    }
    setSubmitting(false);
  };

  const optionRow = (field, options) => (
    <div className="grid grid-cols-2 gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => update(field, opt.value)}
          className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all text-left ${
            answers[field] === opt.value
              ? 'bg-[#0D0D0D] text-[#FAF7F2] border-[#0D0D0D]'
              : 'bg-white text-[#0D0D0D] border-[#E8E0D8] hover:border-[#0D0D0D]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-10 max-w-md w-full text-center" onClick={e => e.stopPropagation()}>
          <p className="text-5xl mb-6">🎉</p>
          <h3 className="font-display font-black text-2xl text-[#0D0D0D] mb-3">{t('adoptQuiz.doneTitle')}</h3>
          <p className="text-[#8c7e74] leading-relaxed mb-8">{t('adoptQuiz.doneMessage', { name: petName })}</p>
          <button onClick={() => navigate('/client/dashboard')} className="btn-dark rounded-xl px-8 py-3">{t('adoptQuiz.doneCta')}</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#FAF7F2] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8">
          {/* Progress bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1 h-1.5 bg-[#E8E0D8] rounded-full overflow-hidden mr-4">
              <div className="h-full bg-coral rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-bold text-[#8c7e74] whitespace-nowrap">{step + 1}/{totalSteps}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>

              {/* STEP 0: WELCOME */}
              {step === 0 && (
                <div className="text-center py-6">
                  <p className="text-5xl mb-6">🐾</p>
                  <h2 className="font-display font-black text-2xl text-[#0D0D0D] mb-3">{t('adoptQuiz.welcome.title')}</h2>
                  <p className="text-[#8c7e74] leading-relaxed mb-2">{t('adoptQuiz.welcome.subtitle')}</p>
                  <p className="text-sm text-[#b8aaa0] mt-6">{t('adoptQuiz.welcome.time')}</p>
                </div>
              )}

              {/* STEP 1: LIFESTYLE */}
              {step === 1 && (
                <div>
                  <h3 className="font-display font-black text-xl text-[#0D0D0D] mb-6">{t('adoptQuiz.lifestyle.title')}</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-bold text-[#0D0D0D] mb-3">{t('adoptQuiz.lifestyle.livingSituation')}</p>
                      {optionRow('livingSituation', [
                        { value: 'alone', label: t('adoptQuiz.lifestyle.livingAlone') },
                        { value: 'couple', label: t('adoptQuiz.lifestyle.livingCouple') },
                        { value: 'family', label: t('adoptQuiz.lifestyle.livingFamily') },
                        { value: 'coliving', label: t('adoptQuiz.lifestyle.livingColiving') },
                      ])}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0D0D0D] mb-3">{t('adoptQuiz.lifestyle.hoursAlone')}</p>
                      {optionRow('hoursAlone', [
                        { value: '0-2', label: '0–2 ' + t('adoptQuiz.hours') },
                        { value: '2-4', label: '2–4 ' + t('adoptQuiz.hours') },
                        { value: '4-8', label: '4–8 ' + t('adoptQuiz.hours') },
                        { value: '8+', label: '8+ ' + t('adoptQuiz.hours') },
                      ])}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0D0D0D] mb-3">{t('adoptQuiz.lifestyle.activityLevel')}</p>
                      {optionRow('activityLevel', [
                        { value: 'low', label: t('adoptQuiz.lifestyle.activityLow') },
                        { value: 'moderate', label: t('adoptQuiz.lifestyle.activityModerate') },
                        { value: 'high', label: t('adoptQuiz.lifestyle.activityHigh') },
                        { value: 'veryHigh', label: t('adoptQuiz.lifestyle.activityVeryHigh') },
                      ])}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: HOME */}
              {step === 2 && (
                <div>
                  <h3 className="font-display font-black text-xl text-[#0D0D0D] mb-6">{t('adoptQuiz.home.title')}</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-bold text-[#0D0D0D] mb-3">{t('adoptQuiz.home.housingType')}</p>
                      {optionRow('housingType', [
                        { value: 'apartment', label: t('adoptQuiz.home.housingApartment') },
                        { value: 'house', label: t('adoptQuiz.home.housingHouse') },
                        { value: 'townhouse', label: t('adoptQuiz.home.housingTownhouse') },
                        { value: 'farm', label: t('adoptQuiz.home.housingFarm') },
                      ])}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0D0D0D] mb-3">{t('adoptQuiz.home.outdoorSpace')}</p>
                      {optionRow('outdoorSpace', [
                        { value: 'none', label: t('adoptQuiz.home.outdoorNone') },
                        { value: 'balcony', label: t('adoptQuiz.home.outdoorBalcony') },
                        { value: 'smallGarden', label: t('adoptQuiz.home.outdoorSmallGarden') },
                        { value: 'largeGarden', label: t('adoptQuiz.home.outdoorLargeGarden') },
                      ])}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0D0D0D] mb-3">{t('adoptQuiz.home.rentOwn')}</p>
                      {optionRow('rentOwn', [
                        { value: 'own', label: t('adoptQuiz.home.rentOwn') },
                        { value: 'rent', label: t('adoptQuiz.home.rentAllowed') },
                        { value: 'rentNotAllowed', label: t('adoptQuiz.home.rentNotAllowed') },
                      ])}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: EXPERIENCE */}
              {step === 3 && (
                <div>
                  <h3 className="font-display font-black text-xl text-[#0D0D0D] mb-6">{t('adoptQuiz.experience.title')}</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-bold text-[#0D0D0D] mb-3">{t('adoptQuiz.experience.pastPets')}</p>
                      {optionRow('pastPetExperience', [
                        { value: 'none', label: t('adoptQuiz.experience.pastNone') },
                        { value: 'some', label: t('adoptQuiz.experience.pastSome') },
                        { value: 'experienced', label: t('adoptQuiz.experience.pastExperienced') },
                        { value: 'professional', label: t('adoptQuiz.experience.pastProfessional') },
                      ])}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0D0D0D] mb-3">{t('adoptQuiz.experience.hasChildren')}</p>
                      {optionRow('hasChildren', [
                        { value: 'no', label: t('adoptQuiz.experience.childrenNo') },
                        { value: 'yesYoung', label: t('adoptQuiz.experience.childrenYoung') },
                        { value: 'yesOlder', label: t('adoptQuiz.experience.childrenOlder') },
                        { value: 'yesTeens', label: t('adoptQuiz.experience.childrenTeens') },
                      ])}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0D0D0D] mb-3">{t('adoptQuiz.experience.hasOtherPets')}</p>
                      {optionRow('hasOtherPets', [
                        { value: 'no', label: t('common.no') },
                        { value: 'yes', label: t('common.yes') },
                      ])}
                      {answers.hasOtherPets === 'yes' && (
                        <textarea
                          value={answers.otherPetsDetail}
                          onChange={e => update('otherPetsDetail', e.target.value)}
                          placeholder={t('adoptQuiz.experience.otherPetsPlaceholder')}
                          className="w-full mt-3 px-4 py-3 rounded-xl border-2 border-[#E8E0D8] bg-white text-sm text-[#0D0D0D] outline-none focus:border-coral transition-colors resize-none"
                          rows={3}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: MATCH */}
              {step === 4 && (
                <div>
                  <h3 className="font-display font-black text-xl text-[#0D0D0D] mb-6">{t('adoptQuiz.match.title')}</h3>
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-bold text-[#0D0D0D] mb-3">{t('adoptQuiz.match.preferredSpecies')}</p>
                      {optionRow('preferredSpecies', [
                        { value: 'dog', label: t('common.species.dog') },
                        { value: 'cat', label: t('common.species.cat') },
                        { value: 'rabbit', label: t('common.species.rabbit') },
                        { value: 'other', label: t('common.species.other') },
                      ])}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0D0D0D] mb-3">{t('adoptQuiz.match.preferredAge')}</p>
                      {optionRow('preferredAge', [
                        { value: 'baby', label: t('adoptQuiz.match.ageBaby') },
                        { value: 'young', label: t('adoptQuiz.match.ageYoung') },
                        { value: 'adult', label: t('adoptQuiz.match.ageAdult') },
                        { value: 'senior', label: t('adoptQuiz.match.ageSenior') },
                      ])}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0D0D0D] mb-3">{t('adoptQuiz.match.preferredSize')}</p>
                      {optionRow('preferredSize', [
                        { value: 'small', label: t('adoptQuiz.match.sizeSmall') },
                        { value: 'medium', label: t('adoptQuiz.match.sizeMedium') },
                        { value: 'large', label: t('adoptQuiz.match.sizeLarge') },
                        { value: 'noPreference', label: t('adoptQuiz.match.sizeNoPreference') },
                      ])}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0D0D0D] mb-3">{t('adoptQuiz.match.preferredEnergy')}</p>
                      {optionRow('preferredEnergy', [
                        { value: 'low', label: t('adoptQuiz.match.energyLow') },
                        { value: 'moderate', label: t('adoptQuiz.match.energyModerate') },
                        { value: 'high', label: t('adoptQuiz.match.energyHigh') },
                        { value: 'noPreference', label: t('adoptQuiz.match.energyNoPreference') },
                      ])}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW */}
              {step === 5 && (
                <div>
                  <h3 className="font-display font-black text-xl text-[#0D0D0D] mb-6">{t('adoptQuiz.review.title')}</h3>
                  <p className="text-sm text-[#8c7e74] mb-6">{t('adoptQuiz.review.subtitle', { name: petName })}</p>

                  <div className="space-y-3 mb-6">
                    {[
                      { label: t('adoptQuiz.lifestyle.livingSituation'), value: t(`adoptQuiz.values.livingSituation.${answers.livingSituation}`, answers.livingSituation) },
                      { label: t('adoptQuiz.lifestyle.hoursAlone'), value: answers.hoursAlone + ' ' + t('adoptQuiz.hours') },
                      { label: t('adoptQuiz.lifestyle.activityLevel'), value: t(`adoptQuiz.values.activityLevel.${answers.activityLevel}`, answers.activityLevel) },
                      { label: t('adoptQuiz.home.housingType'), value: t(`adoptQuiz.values.housingType.${answers.housingType}`, answers.housingType) },
                      { label: t('adoptQuiz.home.outdoorSpace'), value: t(`adoptQuiz.values.outdoorSpace.${answers.outdoorSpace}`, answers.outdoorSpace) },
                      { label: t('adoptQuiz.home.rentOwn'), value: answers.rentOwn === 'own' ? t('adoptQuiz.home.own') : answers.rentOwn === 'rent' ? t('adoptQuiz.home.rentAllowed') : t('adoptQuiz.home.rentNotAllowed') },
                      { label: t('adoptQuiz.experience.pastPets'), value: t(`adoptQuiz.values.pastPetExperience.${answers.pastPetExperience}`, answers.pastPetExperience) },
                      { label: t('adoptQuiz.experience.hasChildren'), value: t(`adoptQuiz.values.hasChildren.${answers.hasChildren}`, answers.hasChildren) },
                      { label: t('adoptQuiz.match.preferredSpecies'), value: t(`adoptQuiz.values.preferredSpecies.${answers.preferredSpecies}`, answers.preferredSpecies) },
                      { label: t('adoptQuiz.match.preferredAge'), value: t(`adoptQuiz.values.preferredAge.${answers.preferredAge}`, answers.preferredAge) },
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center bg-white rounded-xl px-4 py-3 border border-[#E8E0D8]">
                        <span className="text-xs font-bold text-[#8c7e74]">{item.label}</span>
                        <span className="text-sm font-semibold text-[#0D0D0D]">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#0D0D0D] mb-2">{t('adoptQuiz.review.motivation')}</p>
                    <textarea
                      value={answers.motivation}
                      onChange={e => update('motivation', e.target.value)}
                      placeholder={t('adoptQuiz.review.motivationPlaceholder')}
                      className="w-full px-4 py-3 rounded-xl border-2 border-[#E8E0D8] bg-white text-sm text-[#0D0D0D] outline-none focus:border-coral transition-colors resize-none"
                      rows={3}
                    />
                  </div>

                  {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E8E0D8]">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              className={`text-sm font-bold px-5 py-2.5 rounded-xl transition-colors ${step === 0 ? 'invisible' : 'text-[#8c7e74] hover:text-[#0D0D0D]'}`}
            >
              {t('adoptQuiz.back')}
            </button>

            {step < totalSteps - 1 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canProceed()}
                className="btn-dark rounded-xl px-8 py-2.5 text-sm disabled:opacity-40"
              >
                {t('adoptQuiz.next')}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-dark rounded-xl px-8 py-2.5 text-sm disabled:opacity-40"
              >
                {submitting ? t('common.submitting') : t('adoptQuiz.submit')}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
