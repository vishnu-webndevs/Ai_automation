import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import MediaLibrarySelector from './MediaLibrarySelector';
import type { MediaRow } from '../../types';
import { Image as ImageIcon } from 'lucide-react';

interface ImagePickerProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    placeholder?: string;
}

const ImagePicker = ({ value, onChange, label = 'Image', placeholder = 'Image URL' }: ImagePickerProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelect = (media: MediaRow) => {
        onChange(media.url);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-2">
            {label && <label className="block text-xs font-medium text-gray-500">{label}</label>}
            
            <div className="flex gap-2">
                <div className="flex-1">
                    <Input
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                    />
                </div>
                <Button 
                    variant="secondary" 
                    outline 
                    onClick={() => setIsModalOpen(true)}
                    className="shrink-0 px-3"
                    title="Select from Media Library"
                >
                    <ImageIcon className="w-4 h-4" />
                </Button>
            </div>

            {value && (
                <div className="mt-2 relative group w-24 h-16 bg-gray-100 rounded border overflow-hidden">
                    <img 
                        src={value} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Prevent loop
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 100 100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' dy='5' font-weight='bold' x='50' y='50' text-anchor='middle'%3EError%3C/text%3E%3C/svg%3E";
                        }}
                    />
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Select Image"
                size="xl"
            >
                <div className="h-[600px]">
                    <MediaLibrarySelector
                        onSelect={handleSelect}
                        onCancel={() => setIsModalOpen(false)}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default ImagePicker;
