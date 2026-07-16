$files = @(git ls-files --others --exclude-standard; git ls-files -m)
$totalBuckets = 25

$filesArray = @($files)
$bucketSize = [math]::Floor($filesArray.Length / $totalBuckets)
$remainder = $filesArray.Length % $totalBuckets

$currentIndex = 0

for ($i = 0; $i -lt $totalBuckets; $i++) {
    $currentBucketSize = $bucketSize
    if ($i -lt $remainder) {
        $currentBucketSize++
    }
    
    $chunk = $filesArray | Select-Object -Skip $currentIndex -First $currentBucketSize
    $currentIndex += $currentBucketSize
    
    foreach ($file in $chunk) {
        git add "`"$file`""
    }
    
    git commit -m "Upload part $($i + 1) of $totalBuckets"
    git push origin master
}
