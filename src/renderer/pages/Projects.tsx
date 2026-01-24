import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, FolderOpen, Building2, Calendar, MoreVertical, Trash2, Edit2 } from 'lucide-react';

interface Project {
  id: number;
  company_id?: number;
  name: string;
  description?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
}

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'active',
    company_id: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsData, companiesData] = await Promise.all([
        window.api.projects.getAll(),
        window.api.companies.getAll(),
      ]);
      setProjects(projectsData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProject.name.trim()) return;
    
    try {
      await window.api.projects.create({
        ...newProject,
        company_id: newProject.company_id ? parseInt(newProject.company_id) : null,
      });
      setIsDialogOpen(false);
      setNewProject({
        name: '',
        description: '',
        status: 'active',
        company_id: '',
        start_date: '',
        end_date: '',
      });
      loadData();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
    try {
      await window.api.projects.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await window.api.projects.update(id, { status });
      loadData();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const getCompanyName = (companyId?: number) => {
    if (!companyId) return null;
    const company = companies.find(c => c.id === companyId);
    return company?.name;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'on_hold': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'completed': return 'Tamamlandı';
      case 'on_hold': return 'Beklemede';
      case 'cancelled': return 'İptal';
      default: return status;
    }
  };

  const filteredProjects = statusFilter === 'all'
    ? projects
    : projects.filter(p => p.status === statusFilter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projeler</h1>
          <p className="text-gray-500">Tüm projelerinizi yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Proje
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Proje Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Proje Adı *</Label>
                <Input
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="Proje adı"
                />
              </div>
              <div>
                <Label>Firma</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={newProject.company_id}
                  onChange={(e) => setNewProject({ ...newProject, company_id: e.target.value })}
                >
                  <option value="">Firma Seçin (Opsiyonel)</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Durum</Label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                >
                  <option value="active">Aktif</option>
                  <option value="on_hold">Beklemede</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Başlangıç Tarihi</Label>
                  <Input
                    type="date"
                    value={newProject.start_date}
                    onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Bitiş Tarihi</Label>
                  <Input
                    type="date"
                    value={newProject.end_date}
                    onChange={(e) => setNewProject({ ...newProject, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Açıklama</Label>
                <Textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Proje açıklaması..."
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Proje Ekle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button 
          variant={statusFilter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          Tümü ({projects.length})
        </Button>
        <Button 
          variant={statusFilter === 'active' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setStatusFilter('active')}
        >
          Aktif ({projects.filter(p => p.status === 'active').length})
        </Button>
        <Button 
          variant={statusFilter === 'on_hold' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setStatusFilter('on_hold')}
        >
          Beklemede ({projects.filter(p => p.status === 'on_hold').length})
        </Button>
        <Button 
          variant={statusFilter === 'completed' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setStatusFilter('completed')}
        >
          Tamamlandı ({projects.filter(p => p.status === 'completed').length})
        </Button>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Henüz proje yok</p>
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              İlk Projeyi Ekle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      {getCompanyName(project.company_id) && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {getCompanyName(project.company_id)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {project.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <select
                    className={`text-xs px-2 py-1 rounded-full border-0 ${getStatusColor(project.status)}`}
                    value={project.status}
                    onChange={(e) => handleStatusChange(project.id, e.target.value)}
                  >
                    <option value="active">Aktif</option>
                    <option value="on_hold">Beklemede</option>
                    <option value="completed">Tamamlandı</option>
                    <option value="cancelled">İptal</option>
                  </select>
                  
                  {project.start_date && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.start_date).toLocaleDateString('tr-TR')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
