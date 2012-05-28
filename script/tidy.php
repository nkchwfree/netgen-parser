<?php

$strategy = $argv[1];
$buffer = file_get_contents('php://stdin');
if($strategy=='default') {
    $tidy_options = array(
        'input-xml'    => false,
        'output-xml'   => true,
        'indent'       => true,
        'wrap'         => false,
        'hide-comments' => true,
        'escape-cdata'  => true
      );
    $tidy = new tidy();

    if(preg_match('#charset=([-a-z0-9]+)#msi', $buffer, $match)) {
        if(strtoupper($match[1])!='UTF-8') {
            if(strtoupper($match[1])=='GB2312') {
                $match[1] = 'GB18030';
            }
            $buffer = iconv($match[1], 'UTF-8//IGNORE', $buffer);
        }
        //print_r($match);
    }

    //exit;

    $tidy->parseString($buffer, $tidy_options, 'utf8');
    $tidy->cleanRepair();
    echo $tidy;
}
else if($strategy=='original.utf8') { //原始网页内容是纯文本
    //echo iconv("GBK", 'UTF-8//IGNORE', $buffer);
    echo "<html><body>{$buffer}</body></html>";
}
?>
