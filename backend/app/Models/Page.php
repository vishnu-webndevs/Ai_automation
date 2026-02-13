<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Traits\AuditLoggable;
use App\Traits\HasLock;

class Page extends Model
{
    use HasFactory, AuditLoggable, HasLock;

    protected $fillable = ['title', 'slug', 'type', 'status', 'template', 'template_slug', 'locked_at', 'locked_by'];

    protected $casts = [
        'locked_at' => 'datetime',
    ];

    protected $appends = ['locked_status'];

    public function sections()
    {
        return $this->hasMany(PageSection::class)->orderBy('order');
    }

    public function seo()
    {
        return $this->hasOne(SeoMeta::class);
    }

    // Taxonomy Relationships
    public function services()
    {
        return $this->belongsToMany(Service::class, 'page_service_map');
    }

    public function industries()
    {
        return $this->belongsToMany(Industry::class, 'page_industry_map');
    }

    public function useCases()
    {
        return $this->belongsToMany(UseCase::class, 'page_use_case_map');
    }

    public function solutions()
    {
        return $this->belongsToMany(Solution::class, 'page_solution_map');
    }

    public function integrations()
    {
        return $this->belongsToMany(Integration::class, 'page_integration_map');
    }

    // Blog Relationships
    public function blogCategories()
    {
        return $this->belongsToMany(BlogCategory::class, 'blog_category_map');
    }

    public function blogTags()
    {
        return $this->belongsToMany(BlogTag::class, 'blog_tag_map');
    }

    // Internal Linking
    public function internalLinksFrom()
    {
        return $this->hasMany(InternalLink::class, 'source_page_id');
    }

    public function internalLinksTo()
    {
        return $this->hasMany(InternalLink::class, 'target_page_id');
    }

    // SEO
    public function keywords()
    {
        return $this->hasMany(KeywordMap::class);
    }

    public function schemaMarkup()
    {
        return $this->hasOne(SchemaMarkup::class);
    }

    // Versioning
    public function versions()
    {
        return $this->hasMany(ContentVersion::class)->orderBy('version_number', 'desc');
    }

    // CTA
    public function ctas()
    {
        return $this->belongsToMany(Cta::class, 'cta_page_map')->withPivot('placement');
    }
}
