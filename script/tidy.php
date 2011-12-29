<?php

$buffer = file_get_contents('php://stdin');
$tidy_options = array(
    'input-xml'    => false,
    'output-xml'   => true,
    'indent'       => true,
    'wrap'         => false,
  );
$tidy = new tidy();

if(preg_match('#charset=([-a-z0-9]+)#msi', $buffer, $match)) {
    if(strtoupper($match[1])!='UTF-8') {
        if(strtoupper($match[1])=='GB2312') {
            $match[1] = 'GB18030';
        }
        $buffer = iconv($match[1], 'UTF-8//IGNORE', $buffer);
    }
    print_r($match);
}

//exit;

$tidy->parseString($buffer, $tidy_options, 'utf8');
$tidy->cleanRepair();
echo $tidy;
?>
