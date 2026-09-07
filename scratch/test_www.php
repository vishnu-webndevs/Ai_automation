<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;

$req = Request::create('https://www.totan.ai/services', 'GET', [], [], [], ['HTTP_HOST' => 'www.totan.ai']);
echo "Created req host: " . $req->getHost() . "\n";
echo "Created req server HTTP_HOST: " . $req->server->get('HTTP_HOST') . "\n";
