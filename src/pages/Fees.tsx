import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Phone, Mail, Loader2 } from 'lucide-react';
import ShinyText from '../components/ui/ShinyText';
import { ref, onValue } from 'firebase/database';
import { db } from '../lib/firebase';

interface DynamicFeeRecord {
    id: string;
    section: string;
    class_name: string;
    tuition_fee: number;
    admission_fee: number;
    annual_charges?: number;
}

const defaultFeeStructure = [
    { category: 'Playgroup - Class 2', admission: '25,000', tuition: '8,500', annual: '12,000' },
    { category: 'Class 3 - Class 5', admission: '25,000', tuition: '9,500', annual: '12,000' },
    { category: 'Class 6 - Class 8', admission: '30,000', tuition: '10,500', annual: '15,000' },
    { category: 'Metric (9-10)', admission: '35,000', tuition: '12,500', annual: '15,000' },
    { category: 'Inter / A-Levels', admission: '45,000', tuition: '18,500', annual: '20,000' }
];

const Fees: React.FC = () => {
    const [liveFees, setLiveFees] = useState<DynamicFeeRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const feesRef = ref(db, 'fees');
        const unsubscribe = onValue(feesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const dataArray = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id,
                    ...val
                })) as DynamicFeeRecord[];
                setLiveFees(dataArray);
            } else {
                setLiveFees([]);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching fees for public page:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="pt-20 min-h-screen bg-stone-50">
            {/* Header */}
            <div className="bg-primary py-20 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-accent/5 opacity-20"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <ShinyText text="Financial Information" disabled={false} speed={3} className="text-accent font-bold tracking-widest uppercase text-sm mb-4 inline-block" />
                        <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">Fee Structure 2024-25</h1>
                        <p className="text-stone-300 max-w-2xl mx-auto text-lg">
                            Transparent and affordable quality education. Investing in your child's future.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Fee Table */}
            <div className="container mx-auto px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-50 border-b border-stone-200">
                                    <th className="p-6 text-sm font-bold text-stone-500 uppercase tracking-wider">Grade Level</th>
                                    <th className="p-6 text-sm font-bold text-stone-500 uppercase tracking-wider">Admission Fee (PKR) <span className="text-xs font-normal normal-case block text-stone-400">One Time</span></th>
                                    <th className="p-6 text-sm font-bold text-stone-500 uppercase tracking-wider">Monthly Tuition (PKR)</th>
                                    <th className="p-6 text-sm font-bold text-stone-500 uppercase tracking-wider">Annual Charges (PKR) <span className="text-xs font-normal normal-case block text-stone-400">Once a year</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-stone-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="animate-spin text-primary" size={20} />
                                                <span>Loading Fee Structure...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : liveFees.length > 0 ? (
                                    liveFees.map((fee) => (
                                        <tr key={fee.id} className="hover:bg-stone-50/50 transition-colors">
                                            <td className="p-6 font-bold text-stone-800">
                                                {fee.class_name} <span className="text-xs font-normal text-stone-400 block">{fee.section}</span>
                                            </td>
                                            <td className="p-6 text-stone-600 font-medium">
                                                Rs. {fee.admission_fee.toLocaleString()}
                                            </td>
                                            <td className="p-6 text-primary font-bold text-lg">
                                                Rs. {fee.tuition_fee.toLocaleString()}
                                            </td>
                                            <td className="p-6 text-stone-600 font-medium">
                                                {fee.annual_charges ? `Rs. ${fee.annual_charges.toLocaleString()}` : 'Included'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    defaultFeeStructure.map((tier, index) => (
                                        <tr key={index} className="hover:bg-stone-50/50 transition-colors">
                                            <td className="p-6 font-bold text-stone-800">{tier.category}</td>
                                            <td className="p-6 text-stone-600 font-medium">{tier.admission}</td>
                                            <td className="p-6 text-primary font-bold text-lg">{tier.tuition}</td>
                                            <td className="p-6 text-stone-600 font-medium">{tier.annual}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 bg-stone-50 border-t border-stone-100 text-sm text-stone-500 flex items-start gap-3">
                        <ShieldCheck size={20} className="text-emerald-500 shrink-0" />
                        <p>
                            <strong>Note:</strong> Admission fees are non-refundable. Security deposit (refundable) of PKR 10,000 applies to all new admissions.
                            Siblings discount of 15% is valid for the second and third child respectively.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Payment Info */}
            <div className="container mx-auto px-4 pb-20">
                <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-primary"
                    >
                        <h3 className="text-2xl font-bold text-stone-800 mb-6">Payment Guidelines</h3>
                        <ul className="space-y-4">
                            {[
                                'Fees must be paid by the 10th of every month',
                                'Late fee challan of PKR 500 applies after due date',
                                'Online bank transfer and checks are accepted',
                                'Scholarships available for high achievers'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-stone-600">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Check size={14} />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    <div className="bg-primary rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <h3 className="text-2xl font-bold mb-4 relative z-10 font-serif">Need Financial Assistance?</h3>
                        <p className="text-stone-300 mb-8 relative z-10">
                            We believe quality education should be accessible. Contact our accounts office to discuss scholarship opportunities and installment plans.
                        </p>
                        <div className="flex flex-col gap-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <Phone className="text-accent" size={20} />
                                <span className="font-semibold">+1 (555) 123-4567 (Ext. 204)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="text-accent" size={20} />
                                <span className="font-semibold">accounts@spark.edu</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Fees;
