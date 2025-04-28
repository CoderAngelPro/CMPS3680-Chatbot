<?php 
  header('Content-Type: application/json');               // response is JSON
  header('Access-Control-Allow-Origin: https://acortes.cs3680.com'); // CORS, if ever needed
  
  // Enforce HTTPS (keep this; you want https everywhere)
  if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
      header("Location: https://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'], true, 301);
      exit;
  }
  
  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
      try {
          // strict decode with exceptions
          $data = json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
  
          if (empty($data['prompt'])) {
              throw new Exception('Prompt is required');
          }
  
          // sanitise
          $prompt = strip_tags(trim($data['prompt']));
          $apiUrl = 'https://acortes.cs3680.com/generate?' . http_build_query(['prompt' => $prompt]);
  
          // cURL is more reliable than file_get_contents for HTTPS
          $ch = curl_init($apiUrl);
          curl_setopt_array($ch, [
              CURLOPT_RETURNTRANSFER => true,
              CURLOPT_TIMEOUT        => 15,
              CURLOPT_SSL_VERIFYPEER => true,   // default path to CA bundle is fine on most distros
          ]);
          $apiResponse = curl_exec($ch);
          $httpCode    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
          curl_close($ch);
  
          if ($apiResponse === false || $httpCode >= 400) {
              throw new Exception('Generator service unavailable (HTTP ' . $httpCode . ')');
          }
  
          // If /generate already returns JSON, decode it; else leave as string
          $decoded = json_decode($apiResponse, true);
          $text    = is_array($decoded) ? $decoded['message'] ?? $apiResponse : $apiResponse;
  
          echo json_encode([
              'success' => true,
              'text'    => $text
          ]);
      } catch (Exception $e) {
          http_response_code(400);
          echo json_encode([
              'success' => false,
              'error'   => $e->getMessage()
          ]);
      }
      exit;
  }
?>