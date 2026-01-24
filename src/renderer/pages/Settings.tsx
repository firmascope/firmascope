import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Database, FolderOpen, Download, Upload, Trash2, Info } from 'lucide-react';

export const Settings: React.FC = () => {
  const [dbPath, setDbPath] = useState('');
  const [docPath, setDocPath] = useState('');

  const handleExportData = async () => {
    try {
      const [companies, contacts, projects, activities] = await Promise.all([
        window.api.companies.getAll(),
        window.api.contacts.getAll(),
        window.api.projects.getAll(),
        window.api.activities.getAll(),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        companies,
        contacts,
        projects,
        activities,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `firmascope-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Dışa aktarma sırasında hata oluştu');
    }
  };

  const handleClearData = async () => {
    if (!confirm('TÜM VERİLERİ SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ?\n\nBu işlem geri alınamaz!')) return;
    if (!confirm('Son uyarı: Tüm firmalar, kişiler, projeler ve aktiviteler silinecek. Devam?')) return;
    
    // This would need a proper implementation in the main process
    alert('Bu özellik henüz implementlenmedi.');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Ayarlar</h1>
        <p className="text-gray-500">Uygulama ayarlarını yönetin</p>
      </div>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Uygulama Bilgisi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Uygulama</p>
              <p className="font-medium">FirmaScope</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Versiyon</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Geliştirici</p>
              <p className="font-medium">FirmaScope Team</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Platform</p>
              <p className="font-medium">Electron + React</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Veritabanı
          </CardTitle>
          <CardDescription>Veritabanı ayarları ve yedekleme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Veritabanı Konumu</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                value={dbPath || 'Varsayılan konum kullanılıyor'} 
                disabled 
                className="bg-gray-50"
              />
              <Button variant="outline" disabled>
                <FolderOpen className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">SQLite veritabanı dosya konumu</p>
          </div>
        </CardContent>
      </Card>

      {/* Document Storage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Dosya Depolama
          </CardTitle>
          <CardDescription>Dökümanların saklanacağı konum</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Döküman Klasörü</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                value={docPath || 'Varsayılan konum kullanılıyor'} 
                disabled 
                className="bg-gray-50"
              />
              <Button variant="outline" disabled>
                <FolderOpen className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Veri Yönetimi</CardTitle>
          <CardDescription>Verilerinizi dışa aktarın veya içe aktarın</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Verileri Dışa Aktar (JSON)
            </Button>
            <Button variant="outline" disabled>
              <Upload className="w-4 h-4 mr-2" />
              Verileri İçe Aktar
            </Button>
          </div>
          <div className="pt-4 border-t">
            <Button variant="destructive" onClick={handleClearData}>
              <Trash2 className="w-4 h-4 mr-2" />
              Tüm Verileri Sil
            </Button>
            <p className="text-xs text-gray-500 mt-2">Dikkat: Bu işlem geri alınamaz!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
