// import React from 'react';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const StyleGuide = () => {
    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Style Guide</h2>
                <p className="text-slate-500">Design system reference for the Admin Dashboard.</p>
            </div>

            {/* Colors */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Color Palette</h3>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div className="space-y-2">
                            <div className="h-16 w-full rounded-lg bg-indigo-600 shadow-sm"></div>
                            <p className="text-xs font-mono">Primary (indigo-600)</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 w-full rounded-lg bg-purple-600 shadow-sm"></div>
                            <p className="text-xs font-mono">Secondary (purple-600)</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 w-full rounded-lg bg-slate-900 shadow-sm"></div>
                            <p className="text-xs font-mono">Dark (slate-900)</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 w-full rounded-lg bg-slate-500 shadow-sm"></div>
                            <p className="text-xs font-mono">Body (slate-500)</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 w-full rounded-lg bg-green-500 shadow-sm"></div>
                            <p className="text-xs font-mono">Success (green-500)</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-16 w-full rounded-lg bg-red-500 shadow-sm"></div>
                            <p className="text-xs font-mono">Danger (red-500)</p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Typography */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Typography</h3>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-800">Heading 1 (4xl)</h1>
                            <p className="text-xs text-slate-400">Inter Bold</p>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-slate-800">Heading 2 (3xl)</h2>
                            <p className="text-xs text-slate-400">Inter Bold</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800">Heading 3 (2xl)</h3>
                            <p className="text-xs text-slate-400">Inter Bold</p>
                        </div>
                        <div>
                            <h4 className="text-xl font-semibold text-slate-800">Heading 4 (xl)</h4>
                            <p className="text-xs text-slate-400">Inter Semibold</p>
                        </div>
                        <div>
                            <p className="text-base text-slate-600">
                                Body Text (base). Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">
                                Small Text (sm). Used for secondary information and captions.
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Buttons */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Buttons</h3>
                </CardHeader>
                <CardBody>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="primary">Primary Button</Button>
                        <Button variant="secondary">Secondary Button</Button>
                        <Button variant="primary" outline>Outline Button</Button>
                        <Button variant="danger">Danger Button</Button>
                        <Button variant="primary" disabled>Loading</Button>
                    </div>
                </CardBody>
            </Card>

            {/* Badges */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Badges</h3>
                </CardHeader>
                <CardBody>
                    <div className="flex flex-wrap gap-4">
                        <Badge variant="primary">Primary</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="success">Success</Badge>
                        <Badge variant="warning">Warning</Badge>
                        <Badge variant="danger">Danger</Badge>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default StyleGuide;