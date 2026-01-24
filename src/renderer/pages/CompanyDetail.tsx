import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Save, Trash2, Users, FileText, Activity, Edit2, X, Building2, Phone, Mail, Globe, MapPin } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  tax_number?: string;
  tax_office?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  sector?: string;
  notes?: string;
  created_at: string;
}

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  title?: string;
  email?: string;
  phone?: string;
}

interface Document {
  id: number;
  name: string;
  file_type: string;
  created_at: string;
}

export const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Company>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCompanyData(parseInt(id));
    }
  }, [id]);

  const loadCompanyData = async (companyId: number) => {
    try {
      const [companyData, allContacts, allDocuments] = await Promise.all([
        window.api.companies.getById(companyId),
        window.api.contacts.getAll(),
        window.api.documents.getAll(),
      ]);

      setCompany(companyData);
      setEditForm(companyData);
      
      // Filter contacts for this company
      setContacts(allContacts.filter((c: any) => c.company_id === companyId));
      
      // Filter documents for this company
      setDocuments(allDocuments.filter((d: any) => d.company_id === companyId));
    } catch (error) {
      console.error('Error loading company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!company || !id) return;
    try {
      await window.api.companies.update(parseInt(id), editForm);
      setCompany({ ...company, ...editForm } as Company);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Bu firmayı silmek istediğinize emin misiniz?')) return;
    try {
      await window.api.companies.delete(parseInt(id));
      navigate('/companies');
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Firma bulunamadı</p>
        <Button onClick={() => navigate('/companies')} className="mt-4">
          Firmalara Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/companies')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-gray-500">{company.sector || 'Sektör belirtilmemiş'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" />
                İptal
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Firma Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Firma Adı</Label>
                    <Input
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Vergi No</Label>
                    <Input
                      value={editForm.tax_number || ''}
                      onChange={(e) => setEditForm({ ...editForm, tax_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Vergi Dairesi</Label>
                    <Input
                      value={editForm.tax_office || ''}
                      onChange={(e) => setEditForm({ ...editForm, tax_office: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Telefon</Label>
                    <Input
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>E-posta</Label>
                    <Input
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      value={editForm.website || ''}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Sektör</Label>
                    <Input
                      value={editForm.sector || ''}
                      onChange={(e) => setEditForm({ ...editForm, sector: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Adres</Label>
                    <Textarea
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Notlar</Label>
                    <Textarea
                      value={editForm.notes || ''}
                      onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {company.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{company.phone}</span>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{company.email}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a href={company.website} target="_blank" className="text-blue-600 hover:underline">
                          {company.website}
                        </a>
                      </div>
                    )}
                    {company.address && (
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{company.address}</span>
                      </div>
                    )}
                  </div>
                  {company.notes && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600">{company.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contacts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                İlişkili Kişiler ({contacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Bu firmaya ait kişi yok</p>
              ) : (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/contacts/${contact.id}`)}
                    >
                      <div>
                        <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                        <p className="text-sm text-gray-500">{contact.title}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {contact.email || contact.phone}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle>Özet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Vergi No</p>
                <p className="font-medium">{company.tax_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vergi Dairesi</p>
                <p className="font-medium">{company.tax_office || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kayıt Tarihi</p>
                <p className="font-medium">{new Date(company.created_at).toLocaleDateString('tr-TR')}</p>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Dökümanlar ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Döküman yok</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm truncate">{doc.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
