
import { useState } from 'react';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Badge from '../components/ui/Badge';
import { Card, CardBody } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Accordion from '../components/ui/Accordion';
import Breadcrumb from '../components/ui/Breadcrumb';
import ButtonGroup from '../components/ui/ButtonGroup';
import Dropdown from '../components/ui/Dropdown';
import ListGroup from '../components/ui/ListGroup';
import Modal from '../components/ui/Modal';
import Navbar, { Nav, NavItem } from '../components/ui/Navbar';
import Pagination from '../components/ui/Pagination';
import Progress from '../components/ui/Progress';
import Spinner from '../components/ui/Spinner';
import Table from '../components/ui/Table';
import Toast from '../components/ui/Toast';
import Tooltip from '../components/ui/Tooltip';
import Carousel from '../components/ui/Carousel';
import { Checkbox, Radio, Switch, Range } from '../components/ui/Forms';

const HopeUIKit = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="space-y-12 pb-12">
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Hope UI Kit</h1>
        <p className="mt-2 text-gray-600">
          A comprehensive collection of reusable components extracted from the Figma design system.
        </p>
      </div>

      {/* Navigation Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Navigation</h2>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Navbar & Navs</h3>
          <Navbar brand="Hope UI">
            <Nav>
              <NavItem active href="#">Home</NavItem>
              <NavItem href="#">About</NavItem>
              <NavItem href="#">Services</NavItem>
              <NavItem href="#">Contact</NavItem>
            </Nav>
          </Navbar>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Breadcrumbs</h3>
          <Card>
            <CardBody>
              <Breadcrumb items={[
                { label: 'Home', href: '/' },
                { label: 'Library', href: '/library' },
                { label: 'Data', active: true }
              ]} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Pagination</h3>
          <Card>
            <CardBody>
              <Pagination 
                currentPage={currentPage} 
                totalPages={10} 
                onPageChange={setCurrentPage} 
              />
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Layout & Display Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Layout & Display</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Accordion</h3>
            <Accordion items={[
              { id: '1', title: 'What is Hope UI?', content: 'Hope UI is an open source admin dashboard template.' },
              { id: '2', title: 'Is it free?', content: 'Yes, it is completely free to use for personal and commercial projects.' },
              { id: '3', title: 'Can I use it with React?', content: 'Absolutely! This kit is built specifically for React.' }
            ]} />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">List Group</h3>
            <ListGroup items={[
              { content: 'Cras justo odio', active: true },
              { content: 'Dapibus ac facilisis in', badge: 14 },
              { content: 'Morbi leo risus', badge: 2 },
              { content: 'Porta ac consectetur ac' },
              { content: 'Vestibulum at eros', disabled: true }
            ]} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Tables</h3>
          <Table 
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Role', accessor: 'role' },
              { header: 'Status', accessor: 'status' }
            ]}
            data={[
              { name: 'John Doe', role: 'Admin', status: 'Active' },
              { name: 'Jane Smith', role: 'User', status: 'Inactive' },
              { name: 'Bob Johnson', role: 'Editor', status: 'Active' }
            ]}
            striped
            hover
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Carousel</h3>
          <Carousel items={[
             { image: 'https://placehold.co/800x400/2563eb/ffffff?text=Slide+1', caption: 'First Slide' },
             { image: 'https://placehold.co/800x400/16a34a/ffffff?text=Slide+2', caption: 'Second Slide' },
             { image: 'https://placehold.co/800x400/dc2626/ffffff?text=Slide+3', caption: 'Third Slide' }
          ]} />
        </div>
      </section>

      {/* Buttons & Indicators Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Buttons & Indicators</h2>
        
        <div className="space-y-4">
           <h3 className="text-lg font-semibold text-gray-700">Buttons</h3>
           <Card>
            <CardBody className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="info">Info</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="primary" outline>Outline</Button>
                    <Button variant="primary" size="sm">Small</Button>
                    <Button variant="primary" size="lg">Large</Button>
                </div>
                <div>
                   <h4 className="text-sm font-medium text-gray-500 mb-2">Button Group</h4>
                   <ButtonGroup>
                       <Button variant="primary">Left</Button>
                       <Button variant="primary">Middle</Button>
                       <Button variant="primary">Right</Button>
                   </ButtonGroup>
                </div>
            </CardBody>
           </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
             <h3 className="text-lg font-semibold text-gray-700">Badges</h3>
             <div className="flex flex-wrap gap-2">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="danger" pill>Pill Badge</Badge>
             </div>
           </div>
           
           <div className="space-y-4">
             <h3 className="text-lg font-semibold text-gray-700">Spinners</h3>
             <div className="flex items-center gap-4">
                <Spinner variant="primary" />
                <Spinner variant="success" size="lg" />
                <Spinner variant="danger" size="sm" />
             </div>
           </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Progress Bars</h3>
            <Progress value={45} variant="primary" showLabel />
            <Progress value={70} variant="success" striped animated />
            <Progress value={20} variant="danger" height="h-1" />
        </div>
      </section>

      {/* Forms Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Forms</h2>
        <Card>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <Input label="Email Address" placeholder="name@example.com" type="email" />
                    <Input label="Password" type="password" />
                    <Input label="Success Input" state="success" />
                    <Input label="Error Input" state="error" errorMessage="Invalid input!" />
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium">Checkboxes & Radios</h4>
                        <Checkbox label="Default checkbox" defaultChecked />
                        <Checkbox label="Checked checkbox" defaultChecked />
                        <Radio name="radio-group" label="Radio 1" defaultChecked />
                        <Radio name="radio-group" label="Radio 2" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium">Switches & Ranges</h4>
                        <Switch label="Toggle me" defaultChecked />
                        <Range label="Range Slider" />
                    </div>
                </div>
            </CardBody>
        </Card>
      </section>

      {/* Overlays & Interactive Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Overlays & Interactive</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Dropdowns</h3>
                <Dropdown 
                    label="Dropdown Button" 
                    items={[
                        { label: 'Dashboard', href: '/' },
                        { label: 'Settings', href: '/settings' },
                        { label: 'Separator', divider: true },
                        { label: 'Logout', onClick: () => alert('Logged out') }
                    ]} 
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700">Tooltips</h3>
                <div className="flex gap-4">
                    <Tooltip content="Tooltip on top" position="top">
                        <Button variant="secondary">Top</Button>
                    </Tooltip>
                    <Tooltip content="Tooltip on right" position="right">
                        <Button variant="secondary">Right</Button>
                    </Tooltip>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Modals</h3>
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Terms of Service"
                footer={
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Decline</Button>
                        <Button variant="primary" onClick={() => setIsModalOpen(false)}>Accept</Button>
                    </div>
                }
            >
                <p className="text-gray-600">
                    With less than a month to go before the European Union enacts new consumer privacy laws for its citizens, companies around the world are updating their terms of service agreements to comply.
                </p>
                <p className="text-gray-600 mt-4">
                    The European Union’s General Data Protection Regulation (G.D.P.R.) goes into effect on May 25 and is meant to ensure a common set of data rights in the European Union.
                </p>
            </Modal>
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Toasts & Alerts</h3>
            <div className="space-y-2">
                <Alert variant="info">This is an informational alert.</Alert>
                <Toast message="Item deleted successfully." type="success" />
                <Toast message="Something went wrong." type="error" />
            </div>
        </div>
      </section>
    </div>
  );
};

export default HopeUIKit;
